const axios = require('axios');
const key = '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';

async function test() {
    console.log("Testing OpenRouter with key:", key.slice(0, 10) + "...");
    try {
        const res = await axios.post('https://openrouter.ai/api/v1/chat/completions', {
            model: 'meta-llama/llama-3.3-70b-instruct:free',
            messages: [{ role: 'user', content: 'test' }],
        }, {
            timeout: 10000,
            headers: {
                Authorization: 'Bearer ' + key,
                'Content-Type': 'application/json',
            }
        });
        console.log("Success:", res.data.choices[0].message.content);
    } catch (e) {
        if (e.response) {
            console.log("Error response:", JSON.stringify(e.response.data, null, 2));
        } else {
            console.error("Error message:", e.message);
        }
    }
}

test();
