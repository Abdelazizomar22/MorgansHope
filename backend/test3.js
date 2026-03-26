const axios = require('axios');
const key = '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';

async function test() {
    try {
        const res = await axios.post('https://openrouter.ai/api/v1/chat/completions', {
            model: 'google/gemma-3-27b-it:free',
            messages: [{ role: 'user', content: 'hello' }],
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
