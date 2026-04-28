from fastapi import FastAPI

app = FastAPI()

@app.get("/")
def home():
    return {"message": "My app is working!"}

@app.get("/users")
def get_users():
    return {"users": ["Alice", "Bob", "Charlie"]}