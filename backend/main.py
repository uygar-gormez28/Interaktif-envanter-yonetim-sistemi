import json
import os
from fastapi import FastAPI, Query, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from typing import List, Optional
from pydantic import BaseModel
from datetime import datetime

app = FastAPI(title="Belediye IT Envanter API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class NoteModel(BaseModel):
    mesaj: str
    yeni_ram: Optional[str] = None
    yeni_cpu: Optional[str] = None
    yeni_depolama: Optional[str] = None
    yeni_ekran_karti: Optional[str] = None

def get_file_path():
    return os.path.join(os.path.dirname(__file__), "envanter.json")

def load_inventory():
    with open(get_file_path(), "r", encoding="utf-8") as file:
        return json.load(file)

def save_inventory(data):
    with open(get_file_path(), "w", encoding="utf-8") as file:
        json.dump(data, file, ensure_ascii=False, indent=2)

@app.get("/api/inventory")
def get_inventory(
    q: Optional[str] = Query(None, description="Arama metni"),
    mudurluk: Optional[str] = Query(None, description="Müdürlük adı")
):
    data = load_inventory()
    
    if mudurluk and mudurluk.lower() != "tümü":
        data = [item for item in data if item["mudurluk"].lower() == mudurluk.lower()]
        
    if q:
        q_lower = q.lower()
        data = [
            item for item in data 
            if q_lower in item["marka"].lower() or 
               q_lower in item["ip"].lower() or 
               q_lower in item["cpu"].lower() or 
               q_lower in item["isletim_sistemi"].lower()
        ]
        
    return data

@app.get("/api/generate-mock")
def generate_mock():
    import random
    data = load_inventory()
    departments = [
      'İnsan Kaynakları', 'Mali Hizmetler', 'Hukuk İşleri', 
      'Destek Hizmetleri', 'Özel Kalem'
    ]
    all_depts = list(set([item["mudurluk"] for item in data] + departments))

    brands = ['Dell OptiPlex 7090', 'HP EliteDesk 800 G6', 'Lenovo ThinkCentre M70q', 'Apple Mac mini', 'Asus ExpertCenter D5']
    rams = ['8 GB', '16 GB', '32 GB']
    cpus = ['Intel Core i5-10500', 'Intel Core i7-11700', 'Intel Core i9-11900', 'Apple M1']
    osList = ['Windows 10 Pro', 'Windows 11 Pro', 'Ubuntu 22.04 LTS', 'macOS Monterey']
    strList = ['256 GB SSD', '512 GB SSD', '1 TB NVMe SSD']
    gpuList = ['Intel UHD Graphics', 'Intel UHD Graphics 750', 'NVIDIA Quadro P2200 5GB', 'Apple M1 GPU (8-core)']
    statuses = ['Aktif', 'Aktif', 'Aktif', 'Pasif', 'Arızalı']

    pcCountByDept = {}
    for item in data:
        pcCountByDept[item['mudurluk']] = pcCountByDept.get(item['mudurluk'], 0) + 1

    maxId = max([item['id'] for item in data] + [0])

    for dept_index, dept in enumerate(all_depts):
        current = pcCountByDept.get(dept, 0)
        target = random.randint(7, 12)
        if dept == 'Basın' and target < 10: target = 10
        if dept == 'Zabıta' and target < 7: target = 7
            
        if current < target:
            for i in range(target - current):
                maxId += 1
                bIdx = random.randint(0, len(brands)-1)
                data.append({
                  'id': maxId,
                  'marka': brands[bIdx],
                  'mudurluk': dept,
                  'ip': f'192.168.{10 + dept_index * 5}.{50 + i}',
                  'kat': (dept_index % 5),
                  'ram': random.choice(rams),
                  'cpu': random.choice(cpus),
                  'isletim_sistemi': random.choice(osList),
                  'depolama': random.choice(strList),
                  'ekran_karti': random.choice(gpuList),
                  'durum': random.choice(statuses),
                  'gecmis': [{'tarih': '2024-02-15', 'mesaj': 'Sisteme yeni alım ile eklendi.'}]
                })

    save_inventory(data)
    return {"mesaj": "Tüm müdürlüklere yeni cihazlar başarıyla atandı!"}

@app.get("/api/departments")
def get_departments():
    data = load_inventory()
    departments = list(set([item["mudurluk"] for item in data]))
    departments.sort()
    return departments

@app.post("/api/inventory/{item_id}/note")
def add_note(item_id: int, note: NoteModel):
    data = load_inventory()
    for item in data:
        if item["id"] == item_id:
            if "gecmis" not in item:
                item["gecmis"] = []
            
            # Save snapshot of features right BEFORE this change
            snapshot = {
                "ram": item.get("ram"),
                "cpu": item.get("cpu"),
                "depolama": item.get("depolama"),
                "ekran_karti": item.get("ekran_karti")
            }

            # Update features if provided
            if note.yeni_ram: item["ram"] = note.yeni_ram
            if note.yeni_cpu: item["cpu"] = note.yeni_cpu
            if note.yeni_depolama: item["depolama"] = note.yeni_depolama
            if note.yeni_ekran_karti: item["ekran_karti"] = note.yeni_ekran_karti
            
            new_note = {
                "tarih": datetime.now().strftime("%Y-%m-%d %H:%M"),
                "mesaj": note.mesaj,
                "snapshot": snapshot
            }
            item["gecmis"].append(new_note)
            save_inventory(data)
            return {"mesaj": "Not başarıyla eklendi", "gecmis": item["gecmis"], "guncel_veri": item}
            
    raise HTTPException(status_code=404, detail="Bilgisayar bulunamadı")

@app.on_event("startup")
def start_background_scanner():
    import threading
    from scanner import run_scanner
    t = threading.Thread(target=run_scanner, daemon=True)
    t.start()
    print("[*] FastAPI sunucusu başlatıldı. Arka plan donanım tarama servisi çalışıyor...")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
