// VideoSDK Worker Configuration
const WORKER_URL = "https://purple-math-96f1.lawglitch.workers.dev";
const AUTH_URL = `${WORKER_URL}/get-token`;
const CREATE_MEETING_URL = `${WORKER_URL}/create-meeting`;
const VALIDATE_MEETING_URL = `${WORKER_URL}/validate-meeting`;

// Create config object
window.config = {
    WORKER_URL,
    AUTH_URL,
    CREATE_MEETING_URL,
    VALIDATE_MEETING_URL,
    EDGE_FUNCTION_URL: `${WORKER_URL}/api`,
    getHeaders: function() {
        return {
            'Authorization': 'Bearer ' + (localStorage.getItem('token') || ''),
            'Content-Type': 'application/json'
        };
    }
};