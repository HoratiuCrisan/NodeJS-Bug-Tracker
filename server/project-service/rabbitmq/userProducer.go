package rabbitmq

import (
	"context"
	"encoding/json"
	"fmt"
	"time"

	"github.com/google/uuid"
	"github.com/horatiucrisan/project-service/model"
	"github.com/horatiucrisan/project-service/utils"
	"github.com/streadway/amqp"
)

type UserProducer struct {
	conn       *amqp.Connection
	channel    *amqp.Channel
	replyQueue amqp.Queue
	queue      string
}

// NewUserProducer retrieves the queue name and generates a new rabbitMq producer
// that connects to the rabbitMq users consumer
//
// Parameters:
//   - queue: The name of the rabbitMq queue
//
// Returns:
//   - *UserProducer: The new rabbitMq producer
//   - error: An error that occured during the process
func NewUserProducer(queue string) (*UserProducer, error) {
	// Connect the producer to the rabbitmq URL
	conn, err := amqp.Dial(utils.EnvInstances.RABBITMQ_URL)
	if err != nil {
		return nil, err
	}

	// Generate a new channel
	ch, err := conn.Channel()
	if err != nil {
		return nil, err
	}

	// Generate a new rabbitMq queue
	replyQueue, err := ch.QueueDeclare(
		"",
		false,
		true,
		true,
		false,
		nil,
	)

	if err != nil {
		return nil, err
	}

	// Return the producer data
	return &UserProducer{
		conn:       conn,
		channel:    ch,
		replyQueue: replyQueue,
		queue:      queue,
	}, nil
}

// GetUsers method retrieves the user producer and sends a list of user IDs to the consumer
// and retreives the data of each user
//
// Parameters:
//   - userIds: The list of user IDs
//
// Returns:
//   - []model.User: The list of users data
//   - error: An error that occured during the process
func (p *UserProducer) GetUsers(userIds []string) ([]model.User, error) {
	// Generate a new rabbitMq queue
	replyQueue, err := p.channel.QueueDeclare(
		"",
		false,
		true,
		true,
		false,
		nil,
	)
	if err != nil {
		return nil, err
	}

	// Generate a new correlation ID of the reply queue
	correlationId := uuid.New().String()

	// Encode the users list into the JSON format
	body, err := json.Marshal(userIds)
	if err != nil {
		return nil, err
	}

	// Send the data to the rabbitMq users consumer
	err = p.channel.Publish(
		"",
		p.queue,
		false,
		false,
		amqp.Publishing{
			ContentType:   "application/json",
			CorrelationId: correlationId,
			ReplyTo:       replyQueue.Name,
			Body:          body,
		},
	)
	if err != nil {
		return nil, err
	}

	// Retreive the users data from the consumer
	msgs, err := p.channel.Consume(
		replyQueue.Name,
		"",
		true,
		true,
		false,
		false,
		nil,
	)
	if err != nil {
		return nil, err
	}

	// Timeout to reveive the data
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	for {
		select {
		// case for receiving the response message
		case msg := <-msgs:
			// check if the correlation ID is the same as the one from the producer
			if correlationId == msg.CorrelationId {
				var users []model.User
				// decode the data from the message into the users list
				err := json.Unmarshal(msg.Body, &users)
				if err != nil {
					return nil, err
				}
				return users, nil
			}
		// timeout error message for not receiving the message
		case <-ctx.Done():
			return nil, fmt.Errorf("timeout waiting for user service response")
		}
	}
}

// Close function ends the producer connection to rabbitMq
//
// Returns:
//   - error: An error that occured during the process
func (p *UserProducer) Close() error {
	// Close the channel
	if err := p.channel.Close(); err != nil {
		return err
	}

	// Close the connection
	if err := p.conn.Close(); err != nil {
		return err
	}

	return nil
}
