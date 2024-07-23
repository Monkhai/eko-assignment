// Initialize Firebase.
const app = firebase.initializeApp({
    databaseURL: 'DATABASE_URL_PLACEHOLDER',
});

// Initialize Realtime Database and get a reference to the service.
const database = firebase.database(app);