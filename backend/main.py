from fastapi import FastAPI, HTTPException, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
import uuid, datetime

app = FastAPI(title="Imperium Challenge API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─── Schemas ──────────────────────────────────────────────────────────────────

class LoginRequest(BaseModel):
    email: str
    password: str

class SubmissionResponse(BaseModel):
    submission_id: str
    round_id: int
    attempt: int
    max_attempts: int
    status: str
    xp_earned: Optional[int]
    message: str

# ─── Database Schema Design (From Architecture Diagram) ───────────────────────
# These models represent the exact database structure for the backend team.

class UserDB(BaseModel):
    id: str
    email: str
    password: str

class UserProgressDB(BaseModel):
    id: str
    user_id: str
    score: int
    rank: int
    current_round: int

class ChallengeDB(BaseModel):
    id: int
    title: str
    description: str
    challenge_order: int

class RoundDB(BaseModel):
    id: int
    challenge_id: int
    title: str
    description: str
    xp_reward: int
    round_order: int
    max_submission: int
    deadline: str

class SubmissionDB(BaseModel):
    id: str
    user_id: str
    round_id: int
    file_url: str
    file_name: str
    submitted_at: str
    attempt_no: int
    status: str
# ─── In-memory store (replace with DB in prod) ────────────────────────────────

users_db: dict = {
    "USER_001": {
        "id": "USER_001",
        "name": "Alice Hacker",
        "email": "alice@example.com",
        "password": "password123",
        "xp": 0,
        "joined_at": datetime.datetime.utcnow().isoformat(),
    },
    "USER_002": {
        "id": "USER_002",
        "name": "Bob Builder",
        "email": "bob@example.com",
        "password": "password123",
        "xp": 0,
        "joined_at": datetime.datetime.utcnow().isoformat(),
    }
}
submissions_db: dict = {}

# ─── Config (Mock data translated to Backend) ─────────────────────────────────

CHALLENGES_DATA = [
  {"id":1,"num":"01","status":"active","suit":"⬡","title":"DATA COLLECTION","sub":"& PRE-PROCESSING","desc":"Gather, clean and structure raw healthcare datasets. Handle missing values, normalize features, and build the data pipeline.","tags":["Pandas","NumPy","Scikit-learn","EDA"],"objectives":["Load and inspect the hospital dataset","Document all data sources and collection methodology","Handle missing values using imputation strategies","Remove outliers and normalize numerical features","Encode categorical variables (Label / One-Hot)","Export cleaned dataset as processed_data.csv"],"dataset":{"Format":"CSV / JSON","Target":"ICU Admission (binary)"},"output":["processed_data.csv","data_audit_report.html","preprocessing_pipeline.pkl"],"rounds":[1,2]},
  {"id":2,"num":"02","status":"active","suit":"◈","title":"FEATURE EXTRACTION","sub":"& MODEL SELECTION","desc":"Engineer meaningful features from the cleaned dataset. Select the most informative variables and compare candidate models.","tags":["Feature Engineering","PCA","Random Forest","XGBoost","SMOTE"],"objectives":["Apply PCA / dimensionality reduction techniques","Engineer domain-specific clinical features","Handle class imbalance with SMOTE or class weights","Train at least 3 candidate models (LR, RF, XGBoost)","Compare CV scores and justify model selection","Save feature importance plots"],"dataset":{"Input":"processed_data.csv","Val split":"80 / 20"},"output":["feature_matrix.csv","model_comparison.csv","feature_importance.png"],"rounds":[3,4]},
  {"id":3,"num":"03","status":"locked","suit":"▲","title":"MODEL TRAINING","sub":"HYPERPARAMETER TUNING","desc":"Deep-dive into hyperparameter optimization and stratified cross-validation to push your chosen model beyond baseline benchmarks.","tags":["Optuna","MLflow","GridSearchCV","Stratified K-Fold"],"objectives":["Implement Optuna / Bayesian hyperparameter optimization","Apply cross-validation with stratified k-fold","Track all metrics: AUC, F1, Precision, Recall via MLflow","Save best model checkpoint and training curves","Document tuning budget and best parameter set"],"dataset":{"Input":"feature_matrix.csv","CV Folds":"5"},"output":["best_model.pkl","tuning_results.json","training_curves.png"],"rounds":[5]},
  {"id":4,"num":"04","status":"locked","suit":"◉","title":"MODEL EVALUATION","sub":"& DEPLOYMENT","desc":"Rigorously evaluate your trained model, interpret predictions with SHAP, and package the solution as a deployable API endpoint.","tags":["SHAP","FastAPI","Docker","Prometheus","Model Cards"],"objectives":["Evaluate on unseen test set — report AUC, F1, Brier Score","Generate SHAP waterfall and summary plots","Write a Model Card documenting limitations & bias","Package inference as a FastAPI endpoint","Containerize with Docker","Submit final Jupyter notebook"],"dataset":{"Eval metrics":"AUC, F1, Brier","API endpoint":"/predict","Submission":"imperium_final.ipynb"},"output":["evaluation_report.pdf","shap_plots.png","imperium_final.ipynb","Dockerfile"],"rounds":[6,7]},
]

ROUNDS_DATA = [
  {"id":1,"name":"Data Collection","desc":"Gather and load the raw hospital dataset. Inspect shape, dtypes, missing value counts, and document your data sources.","pts":100,"accepts":".csv,.ipynb","max_attempts":3},
  {"id":2,"name":"Preprocessing","desc":"Apply full cleaning pipeline: impute missing values, remove outliers, normalize features, encode categoricals. Output processed_data.csv.","pts":150,"accepts":".csv,.ipynb","max_attempts":1},
  {"id":3,"name":"Feature Extraction","desc":"Engineer domain-specific clinical features, apply PCA/dimensionality reduction, and output a documented feature_matrix.csv.","pts":200,"accepts":".csv,.ipynb","max_attempts":1},
  {"id":4,"name":"Model Selection","desc":"Train at least 3 candidate models (LR, RF, XGBoost), compare CV scores, and justify your chosen model with a summary report.","pts":250,"accepts":".csv,.ipynb","max_attempts":1},
  {"id":5,"name":"Model Training","desc":"Perform hyperparameter tuning (Optuna/GridSearch), handle class imbalance, log all experiments to MLflow, and save the best model checkpoint.","pts":350,"accepts":".csv,.ipynb","max_attempts":1},
  {"id":6,"name":"Model Evaluation","desc":"Evaluate on the holdout test set. Report AUC, F1, Brier Score. Generate SHAP waterfall and summary plots. Write a Model Card.","pts":300,"accepts":".csv,.ipynb","max_attempts":1},
  {"id":7,"name":"Deployment","desc":"Package inference as a FastAPI endpoint, containerize with Docker, and submit imperium_final.ipynb with full documentation.","pts":500,"accepts":".csv,.ipynb","isFinal":True,"max_attempts":1},
]

# ─── Auth (simplified) ────────────────────────────────────────────────────────

def get_user(user_id: str):
    user = users_db.get(user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

# ─── User Endpoints ───────────────────────────────────────────────────────────

@app.post("/auth/login", tags=["Auth"])
def login(data: LoginRequest):
    """Login participant."""
    for user_id, user in users_db.items():
        if user["email"] == data.email and user["password"] == data.password:
            return {"user_id": user_id, "message": "Logged in successfully"}
    raise HTTPException(status_code=401, detail="Invalid credentials")

@app.get("/users/{user_id}", tags=["Users"])
def get_profile(user_id: str):
    """Get participant profile and XP."""
    user = get_user(user_id)
    user_subs = {
        k: v for k, v in submissions_db.items()
        if v["user_id"] == user_id
    }
    completed_rounds = list({v["round_id"] for v in user_subs.values() if v["status"] == "accepted"})
    # Exclude password from response
    user_profile = {k: v for k, v in user.items() if k != "password"}
    return {**user_profile, "completed_rounds": completed_rounds}

@app.get("/users/{user_id}/submissions", tags=["Users"])
def get_user_submissions(user_id: str):
    """List all submissions by a participant."""
    get_user(user_id)
    return [v for v in submissions_db.values() if v["user_id"] == user_id]

# ─── Challenge Endpoints ──────────────────────────────────────────────────────

@app.get("/challenges", tags=["Challenges"])
def list_challenges():
    """List all challenges."""
    return CHALLENGES_DATA

@app.get("/challenges/{challenge_id}", tags=["Challenges"])
def get_challenge(challenge_id: int):
    """Get a specific challenge with its rounds."""
    ch = next((c for c in CHALLENGES_DATA if c["id"] == challenge_id), None)
    if not ch:
        raise HTTPException(status_code=404, detail="Challenge not found")
    return ch

# ─── Round Endpoints ──────────────────────────────────────────────────────────

@app.get("/rounds", tags=["Rounds"])
def list_rounds():
    """List all rounds."""
    return ROUNDS_DATA

@app.get("/rounds/{round_id}", tags=["Rounds"])
def get_round(round_id: int):
    """Get details for a specific round."""
    r = next((r for r in ROUNDS_DATA if r["id"] == round_id), None)
    if not r:
        raise HTTPException(status_code=404, detail="Round not found")
    return r

# ─── Submission Endpoints ─────────────────────────────────────────────────────

@app.post("/rounds/{round_id}/submit", tags=["Submissions"], response_model=SubmissionResponse)
async def submit_round(
    round_id: int,
    user_id: str = Form(...),
    file: UploadFile = File(...),
):
    """
    Submit code for a round.
    """
    get_user(user_id)
    r = next((r for r in ROUNDS_DATA if r["id"] == round_id), None)
    if not r:
        raise HTTPException(status_code=404, detail="Round not found")

    # Check prerequisite round
    if round_id > 1:
        prev_round_id = round_id - 1
        prev_done = any(
            v["user_id"] == user_id and v["round_id"] == prev_round_id and v["status"] == "accepted"
            for v in submissions_db.values()
        )
        if not prev_done:
            raise HTTPException(
                status_code=400,
                detail=f"Complete Round {prev_round_id} before submitting Round {round_id}"
            )

    # Count existing attempts
    attempts = [
        v for v in submissions_db.values()
        if v["user_id"] == user_id and v["round_id"] == round_id
    ]
    attempt_num = len(attempts) + 1
    max_att = r["max_attempts"]

    if len(attempts) >= max_att:
        raise HTTPException(
            status_code=400,
            detail=f"Submission limit reached ({max_att}/{max_att})"
        )

    # Accept submission
    sub_id = str(uuid.uuid4())[:12].upper()
    is_final = attempt_num >= max_att
    xp = r["pts"] if is_final else None
    status = "accepted" if is_final else "pending"

    if is_final:
        users_db[user_id]["xp"] += r["pts"]

    submissions_db[sub_id] = {
        "submission_id": sub_id,
        "user_id": user_id,
        "round_id": round_id,
        "filename": file.filename,
        "attempt": attempt_num,
        "max_attempts": max_att,
        "status": status,
        "xp_earned": xp,
        "submitted_at": datetime.datetime.utcnow().isoformat(),
    }

    return SubmissionResponse(
        submission_id=sub_id,
        round_id=round_id,
        attempt=attempt_num,
        max_attempts=max_att,
        status=status,
        xp_earned=xp,
        message=f"Submission {attempt_num}/{max_att} received. {'Round complete!' if is_final else f'{max_att - attempt_num} attempt(s) remaining.'}"
    )

@app.get("/submissions/{submission_id}", tags=["Submissions"])
def get_submission(submission_id: str):
    """Get details of a specific submission."""
    sub = submissions_db.get(submission_id)
    if not sub:
        raise HTTPException(status_code=404, detail="Submission not found")
    return sub

# ─── Leaderboard ──────────────────────────────────────────────────────────────

@app.get("/leaderboard", tags=["Leaderboard"])
def get_leaderboard():
    """Get top participants ranked by XP."""
    ranked = sorted(users_db.values(), key=lambda u: u["xp"], reverse=True)
    return [
        {"rank": i + 1, "user_id": u["id"], "name": u["name"], "xp": u["xp"]}
        for i, u in enumerate(ranked)
    ]
