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

the DB tests are connecting to a local firebase emulator. This means that before running the tests you must first start the emulator:

```bash
firebase emulators:start --only firestore
```

then run the tests:

```bash
npm run test
```
