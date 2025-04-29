package rabbitmq

import (
	"context"
	"encoding/json"
	"fmt"
	"time"

	"github.com/google/uuid"
	"github.com/horatiucrisan/project-service/model"
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

	correlationId := uuid.New().String()

	body, err := json.Marshal(userIds)
	if err != nil {
		return nil, err
	}

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

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	for {
		select {
		case msg := <-msgs:
			if correlationId == msg.CorrelationId {
				var users []model.User
				err := json.Unmarshal(msg.Body, &users)
				if err != nil {
					return nil, err
				}
				return users, nil
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
