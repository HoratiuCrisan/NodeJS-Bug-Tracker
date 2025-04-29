package rabbitmq

import (
	"context"
	"encoding/json"
	"fmt"
	"time"

	"github.com/google/uuid"
	"github.com/horatiucrisan/task-service/model"
	"github.com/streadway/amqp"
)

type UserProducer struct {
	conn       *amqp.Connection
	channel    *amqp.Channel
	replyQueue amqp.Queue
	queue      string
}

func NewUserProducer(rabbitmqURL, queue string) (*UserProducer, error) {
	conn, err := amqp.Dial(rabbitmqURL)
	if err != nil {
		return nil, err
	}

	ch, err := conn.Channel()
	if err != nil {
		return nil, err
	}

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

	return &UserProducer{
		conn:       conn,
		channel:    ch,
		replyQueue: replyQueue,
		queue:      queue,
	}, nil
}

func (p *UserProducer) GetUsers(userIds []string) ([]model.User, error) {
	// Declare a temporary queue for receiving the response
	replyQueue, err := p.channel.QueueDeclare(
		"",    // Let RabbitMQ generate a unique queue name
		false, // Non-durable
		true,  // Auto-delete when no consumers are connected
		true,  // Exclusive (only this connection can consume it)
		false, // No-wait
		nil,   // Arguments
	)
	if err != nil {
		return nil, err
	}

	// Generate a unique correlation ID for this request-response cycle
	correlationId := uuid.New().String()

	// Marshal user IDs into the body of the message
	body, err := json.Marshal(userIds)
	if err != nil {
		return nil, err
	}

	// Send the request to the user service
	err = p.channel.Publish(
		"",      // Default exchange
		p.queue, // User service queue name (replace with actual user service queue)
		false,   // Mandatory flag
		false,   // Immediate flag
		amqp.Publishing{
			ContentType:   "application/json",
			CorrelationId: correlationId,   // Unique correlation ID for matching response
			ReplyTo:       replyQueue.Name, // Set replyTo to the temporary queue name
			Body:          body,            // Body contains the userIds
		},
	)
	if err != nil {
		return nil, err
	}

	// Consume messages from the temporary reply queue
	msgs, err := p.channel.Consume(
		replyQueue.Name, // Name of the temporary queue to receive responses
		"",
		true,  // Auto-acknowledge messages
		true,  // Exclusive consumer
		false, // No-local
		false, // No-wait
		nil,   // Arguments
	)
	if err != nil {
		return nil, err
	}

	// Set up a context with a timeout to avoid waiting forever for a response
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	// Wait for the response and match the correlation ID
	for {
		select {
		case msg := <-msgs:
			if correlationId == msg.CorrelationId {
				var users []model.User
				err := json.Unmarshal(msg.Body, &users)
				if err != nil {
					return nil, err
				}
				return users, nil // Return the list of users from the response
			}
		case <-ctx.Done():
			return nil, fmt.Errorf("timeout waiting for user service response")
		}
	}
}

func (p *UserProducer) Close() error {
	if err := p.channel.Close(); err != nil {
		return err
	}

	if err := p.conn.Close(); err != nil {
		return err
	}

	return nil
}
