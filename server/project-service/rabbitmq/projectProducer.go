package rabbitmq

import (
	"encoding/json"

	"github.com/horatiucrisan/project-service/utils"
	"github.com/streadway/amqp"
)

type ProjectProducer struct {
	conn    *amqp.Connection
	channel *amqp.Channel
	queue   string
}

func NewProjectProducer(queue string) (*ProjectProducer, error) {
	conn, err := amqp.Dial(utils.EnvInstances.RABBITMQ_URL)
	if err != nil {
		return nil, err
	}

	ch, err := conn.Channel()
	if err != nil {
		return nil, err
	}

	_, err = ch.QueueDeclare(
		queue,
		true,
		false,
		false,
		false,
		nil,
	)
	if err != nil {
		return nil, err
	}

	return &ProjectProducer{conn, ch, queue}, nil
}

func (p *ProjectProducer) SendMessage(message any) error {
	body, err := json.Marshal(message)
	if err != nil {
		return err
	}

	return p.channel.Publish(
		"",
		p.queue,
		false,
		false,
		amqp.Publishing{
			ContentType: "application/json",
			Body:        body,
		},
	)
}
