- [ ] Inspect FastAPI backend label mapping logic (classes.json vs classes (1).json vs data.pkl)
- [ ] Patch backend/api_server/main.py to correctly load the label mapping from your provided file (including handling object/map JSON)
- [ ] Add a safe fallback to derive labels from data.pkl if it contains the mapping
- [ ] Run backend locally (or a quick /health + sample /predict) to verify disease_name matches expected class ids
- [ ] Ensure frontend consumes the backend response unchanged

