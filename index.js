const nodemailer = require("nodemailer");
const spawn = require("child_process").spawn;
const config = require("config");
const log = require("bunyan").createLogger({ name: "DockerErrorStreamHandler" });

log.info({ config }, "Starting DockerErrorStreamHandler");

var transporter = nodemailer.createTransport({
    host: "localhost",
    port: 25,
    tls: { rejectUnauthorized: false }
});


config.containers.forEach((container) => {
    const process = spawn("docker", ["logs", "-f", "--tail=0", container]);

    process.stderr.on("data", (data) => {
        const now = new Date().toISOString();
        const error = data.toString();
        if(error.length > 100) log.info({ error: `${error.slice(0, 100)} .. [chopped]`.replace("\n", " "), container }, "Error logged");
        else log.info({ error: error.replace("\n", " "), container }, "Error logged");

        sendErrorMails(container, error, now);
    });

    process.on("exit", (code) => {
        const now = new Date().toISOString();
        log.info({ code: code.toString() }, `Container "${container}" exited`);

        sendTerminationMails(container, code.toString(), now);
    });
});

function sendErrorMails(container, error, time) {
    config.mail.recipients.forEach((recipient) => {
        let mailOptions = {
            from: config.mail.from,
            to: recipient,
            subject: `Error from "${container}"`,
            text: `Error logged from "${container}" at ${time}:\n${error}`
        };

        transporter.sendMail(mailOptions, (error) => {
            if(error) throw error;
        });
    });
}

function sendTerminationMails(container, code, time) {
    config.mail.recipients.forEach((recipient) => {
        let mailOptions = {
            from: config.mail.from,
            to: recipient,
            subject: `Container "${container}" terminated`,
            text: `Container "${container}" terminated at ${time} with code ${code}`
        };

        transporter.sendMail(mailOptions, (error) => {
            if(error) throw error;
        });
    });
}
