# How to run this project

1. install dependencies

```bash
npm install
```

2. run the project

```bash
npm run dev
```

# How to run the tests

the DB tests are connecting to a local firebase emulator. This means that before running the tests you must first start the emulator. If you don't have firebase install, first set that up:

```bash
npm install -g firebase-tools
```

then login to firebase: (important to login to the account that has access to the firebase project)

```bash
firebase login
```

then start the emulator:

```bash
firebase emulators:start --only firestore
```

then run the tests:

```bash
npm run test
```
