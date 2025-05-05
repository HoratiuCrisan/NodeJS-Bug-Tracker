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

// NewProjectProducer function retrieves the name of the queue, and generates a new rabbitMq producer
//
// Parameters:
//   - queue: The name of the rabbitMq queue
//
// Returns:
//   - *ProjectProducer: The new rabbitMq producer
//   - error: An error that occured during the process
func NewProjectProducer(queue string) (*ProjectProducer, error) {
	// Estalish the connection the the rabbitMq url
	conn, err := amqp.Dial(utils.EnvInstances.RABBITMQ_URL)
	if err != nil {
		return nil, err
	}

	// Generate a new channel
	ch, err := conn.Channel()
	if err != nil {
		return nil, err
	}

	// Generate a new rabbitmq queue
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

	// Return the producer data
	return &ProjectProducer{conn, ch, queue}, nil
}

// SendMessage retrieves the message data and sends it to the rabbitMq consumer
//
// Parameters:
//   - message: The message to send to the consumer
//
// Returns:
//   - error: An error that occured during the process
func (p *ProjectProducer) SendMessage(message any) error {
	// Encode the data into the JSON format
	body, err := json.Marshal(message)
	if err != nil {
		return err
	}

	// Publish the message to the rabbitMq consumer
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
