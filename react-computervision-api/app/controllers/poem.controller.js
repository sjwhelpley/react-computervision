require('dotenv').config();

const { Configuration, OpenAIApi } = require("openai");

const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

exports.getPoem = async (req, res) => {
    if (!req.body.expression) {
        res.status(400).send({ message: "Content can not be empty!" });
        return;
    }

    try {
        const response = await openai.createCompletion({
            model: "text-davinci-002",
            prompt: generatePrompt(req.body.expression),
            temperature: 0.7,
            max_tokens: 500,
            top_p: 0.6,
            frequency_penalty: 0,
            presence_penalty: 0,
        });
        res.status(200).json({ result: response.data.choices[0].text });
    } catch (err) {
        res.status(500).json({ error: err });
    }
}

function generatePrompt(expression) {
    switch (expression) {
        case "happy":
            return "I am feeling happy. Write me a poem.";
        case "sad":
            return "Write a poem to stop someone from being sad";
        case "angry":
            return "Write a poen to stop someone from being angry";
        default:
            return `Write a poem for someone feeling ${expression}`
    }
}