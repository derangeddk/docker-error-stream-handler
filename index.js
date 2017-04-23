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
    const process = spawn("docker", ["logs", "-f", "--tail=10", container]);

    process.stderr.on("data", (data) => {
        const now = new Date().toISOString();
        const error = data.toString();
        log.info({ error: error.slice(0, 100), container }, "Error logged");

        config.mail.recipients.forEach((recipient) => {
            let mailOptions = {
                from: config.mail.from,
                to: recipient,
                subject: `Error from ${container}`,
                text: `Error logged from ${container} at ${now}:\n${error}`
            };

            transporter.sendMail(mailOptions, (error) => {
                if(error) throw error;
            });
        });
    });

    process.on("exit", (code) => {
        log.info({ code: code.toString() }, `Container ${container} exited`);
    });
});
