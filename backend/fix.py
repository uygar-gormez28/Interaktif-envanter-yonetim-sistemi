import json
import random
import os

db_path = 'envanter.json'
with open(db_path, 'r', encoding='utf-8') as f:
    data = json.load(f)

# Belirtilen departmanlar dahil tüm departmanları birleştirelim
new_departments = [
  'İnsan Kaynakları',
  'Mali Hizmetler',
  'Hukuk İşleri',
  'Destek Hizmetleri',
  'Özel Kalem'
]
departments = list(set([item['mudurluk'] for item in data] + new_departments))

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

for dept_index, dept in enumerate(departments):
    current = pcCountByDept.get(dept, 0)
    target = random.randint(7, 12)
    # Eğer özel istismar varsa, Basın için min 10
    if dept == 'Basın' and target < 10:
        target = random.randint(10, 12)
    if dept == 'Zabıta' and target < 7:
        target = random.randint(7, 9)
        
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

with open(db_path, 'w', encoding='utf-8') as f:
    json.dump(data, f, ensure_ascii=False, indent=2)

print("SUCCESS")
