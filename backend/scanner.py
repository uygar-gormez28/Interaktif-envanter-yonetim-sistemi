import subprocess
import platform
import json
import os
import time
from datetime import datetime, timezone
from concurrent.futures import ThreadPoolExecutor, as_completed
from threading import Lock

# ---------------- AYARLAR ----------------
START_BLOCK = 1   # 172.16.1.x (Varsayılan tarama aralığı, gerçek kullanımda değiştirebilirsiniz)
END_BLOCK = 24    # 172.16.24.x
START_IP = 21     
END_IP = 254      

MAX_THREADS = 80          
SCAN_INTERVAL_SEC = 60    
PING_TIMEOUT_MS = 400     

ENVANTER_FILE = os.path.join(os.path.dirname(__file__), "envanter.json")
PSEXEC_PATH = os.path.join(os.path.dirname(__file__), "PsExec.exe")

lock = Lock()

def utc_now_iso():
    return datetime.now().strftime("%Y-%m-%d %H:%M")

def build_ip_list():
    ip_list = []
    # Test amaçlı kendi IP aralığınızı bu listeye ekleyebilirsiniz.
    # Şimdilik mevcut cihazların IP'lerini (gerçek envanter.json'dan okuyarak) veya 192.168'li bir bloğu tarayabiliriz.
    for block in [10, 15, 20, 30, 40, 50, 60, 70]:  # Mevcut envanterdeki bloklar
        for i in range(2, 60):
            ip_list.append(f"192.168.{block}.{i}")
            
    # Asıl projedeki 172.16.x.x ağını taramak isterseniz:
    for block in range(START_BLOCK, END_BLOCK + 1):
        for i in range(START_IP, END_IP + 1):
            ip_list.append(f"172.16.{block}.{i}")
            
    return ip_list

def ping_check(ip: str) -> bool:
    param = "-n" if platform.system().lower() == "windows" else "-c"
    timeout_flag = "-w" if platform.system().lower() == "windows" else "-W"
    timeout_val = str(PING_TIMEOUT_MS) if platform.system().lower() == "windows" else "1"

    cmd = ["ping", param, "1", timeout_flag, timeout_val, ip]
    try:
        result = subprocess.run(cmd, capture_output=True, text=True, timeout=2)
        return result.returncode == 0
    except Exception:
        return False

def get_remote_info(ip):
    results = {"IP": ip}
    
    ps_script = (
        "Write-Host '---START---';"
        "$hostname = hostname;"
        "$cpu = (Get-WmiObject Win32_Processor).Name;"
        "$ramSum = (Get-WmiObject Win32_PhysicalMemory | Measure-Object -Property Capacity -Sum).Sum;"
        "$ramGB = [Math]::Round($ramSum / 1GB, 2);"
        "$diskType = (Get-PhysicalDisk | Where-Object {$_.DeviceID -eq (Get-Partition -DriveLetter C).DiskNumber}).MediaType;"
        "$hddSize = (Get-WmiObject Win32_LogicalDisk | Where-Object {$_.DeviceID -eq 'C:'}).Size / 1GB;"
        "$diskInfo = \"$([Math]::Round($hddSize, 2)) GB $diskType\";"
        "$gpu = (Get-WmiObject Win32_VideoController | Select-Object Name, AdapterRAM);"
        "$macs = (Get-WmiObject Win32_NetworkAdapterConfiguration | Where-Object {$_.IPEnabled -eq $true}).MACAddress -join ' / ';"
        "$os = (Get-WmiObject Win32_OperatingSystem).Caption;"
        "Write-Host \"Name: $hostname\";"
        "Write-Host \"MAC: $macs\";"
        "Write-Host \"CPU: $cpu\";"
        "Write-Host \"RAM: $ramGB GB\";"
        "Write-Host \"HDD: $diskInfo\";"
        "Write-Host \"OS: $os\";"
        "foreach($g in $gpu){ Write-Host \"GPU: $($g.Name)\" };"
    )

    cmd = [PSEXEC_PATH, "-accepteula", f"\\\\{ip}", "powershell", "-Command", ps_script]
    
    try:
        process = subprocess.run(cmd, capture_output=True, text=True, timeout=30, errors='replace') # Hızlı tarama için timeoutu kıstık
        output = process.stdout
        
        if not output or "---START---" not in output:
            return {"IP": ip, "Error": "Baglanti saglandi ancak veri alinamadi."}
        
        gpus = []
        lines = output.split('\n')
        for line in lines:
            if ":" in line:
                key, val = line.split(":", 1)
                key = key.strip()
                val = val.strip()
                if key == "GPU":
                    gpus.append(val)
                else:
                    results[key] = val
        if gpus:
            results["GPU"] = ", ".join(gpus)
            
        return results
    except subprocess.TimeoutExpired:
        return {"IP": ip, "Error": "Zaman Asimi."}
    except Exception as e:
        return {"IP": ip, "Error": str(e)}

def load_inventory():
    if not os.path.isfile(ENVANTER_FILE):
        return []
    try:
        with open(ENVANTER_FILE, "r", encoding="utf-8") as f:
            return json.load(f)
    except Exception:
        return []

def save_inventory(data):
    tmp = ENVANTER_FILE + ".tmp"
    with open(tmp, "w", encoding="utf-8") as file:
        json.dump(data, file, ensure_ascii=False, indent=2)
    os.replace(tmp, ENVANTER_FILE)

def process_ip(ip: str):
    alive = ping_check(ip)
    return ip, alive

def get_max_id(data):
    if not data: return 0
    return max([item.get('id', 0) for item in data])

def run_scanner():
    print("[*] Arka Plan Tarayıcı Başlatıldı (Otomatik Donanım Keşfi)")
    
    while True:
        try:
            ip_list = build_ip_list()
            
            # Sadece ping atanları bul
            online_ips = []
            with ThreadPoolExecutor(max_workers=MAX_THREADS) as ex:
                futures = [ex.submit(process_ip, ip) for ip in ip_list]
                for fut in as_completed(futures):
                    ip, alive = fut.result()
                    if alive:
                        online_ips.append(ip)

            if online_ips:
                with ThreadPoolExecutor(max_workers=min(20, MAX_THREADS)) as ex:
                    audit_futs = {ex.submit(get_remote_info, ip): ip for ip in online_ips}
                    for fut in as_completed(audit_futs):
                        ip = audit_futs[fut]
                        details = fut.result()
                        
                        if "Error" in details:
                            # Hata varsa (psexec erisimi yoksa) atla
                            continue
                            
                        # Başarılı veri çekildi.
                        with lock:
                            inv_data = load_inventory()
                            # Bu IP veya MAC(Eğer istenirse) envanterde var mı? Biz IP'ye göre eşliyoruz.
                            existing_device = next((item for item in inv_data if item.get("ip") == ip), None)
                            
                            now_str = utc_now_iso()
                            
                            if existing_device:
                                # Donanım değişti mi kontrolü
                                snapshot = {}
                                changes = []
                                
                                if "RAM" in details and existing_device.get("ram") != details["RAM"]:
                                    snapshot["ram"] = existing_device.get("ram")
                                    changes.append(f"RAM {existing_device.get('ram')} -> {details['RAM']}")
                                    existing_device["ram"] = details["RAM"]
                                    
                                if "CPU" in details and existing_device.get("cpu") != details["CPU"]:
                                    snapshot["cpu"] = existing_device.get("cpu")
                                    changes.append(f"CPU {existing_device.get('cpu')} -> {details['CPU']}")
                                    existing_device["cpu"] = details["CPU"]
                                    
                                if "HDD" in details and existing_device.get("depolama") != details["HDD"]:
                                    snapshot["depolama"] = existing_device.get("depolama")
                                    changes.append(f"Depolama {existing_device.get('depolama')} -> {details['HDD']}")
                                    existing_device["depolama"] = details["HDD"]
                                    
                                if "GPU" in details and existing_device.get("ekran_karti") != details["GPU"]:
                                    snapshot["ekran_karti"] = existing_device.get("ekran_karti")
                                    changes.append(f"GPU {existing_device.get('ekran_karti')} -> {details['GPU']}")
                                    existing_device["ekran_karti"] = details["GPU"]
                                    
                                # OS Kontrolü
                                if "OS" in details and existing_device.get("isletim_sistemi") != details["OS"]:
                                    existing_device["isletim_sistemi"] = details["OS"]

                                if changes:
                                    if "gecmis" not in existing_device:
                                        existing_device["gecmis"] = []
                                    existing_device["gecmis"].append({
                                        "tarih": now_str,
                                        "mesaj": "Arka plan tarayıcısı donanım değişikliği tespit etti: " + ", ".join(changes),
                                        "snapshot": snapshot
                                    })
                                    save_inventory(inv_data)
                                    print(f"[!] {ip} için donanım güncellendi: {changes}")
                            else:
                                # Yeni Cihaz
                                max_id = get_max_id(inv_data)
                                new_id = max_id + 1
                                
                                new_device = {
                                    "id": new_id,
                                    "marka": details.get("Name", "Bilinmiyor (Otomatik)"),
                                    "mudurluk": "Bilinmiyor (Yeni Tespit)",
                                    "ip": ip,
                                    "kat": "Bilinmiyor",
                                    "ram": details.get("RAM", "?"),
                                    "cpu": details.get("CPU", "?"),
                                    "isletim_sistemi": details.get("OS", "Windows (Tespit Edildi)"),
                                    "depolama": details.get("HDD", "?"),
                                    "ekran_karti": details.get("GPU", "?"),
                                    "durum": "Aktif",
                                    "gecmis": [
                                        {
                                            "tarih": now_str,
                                            "mesaj": "Arka plan otomatik tarama aracı ile sisteme eklendi."
                                        }
                                    ]
                                }
                                inv_data.append(new_device)
                                save_inventory(inv_data)
                                print(f"[+] Yeni Cihaz Keşfedildi ve Eklendi: {ip}")

        except Exception as e:
            print(f"[!] Tarama Döngüsünde Hata: {e}")

        time.sleep(SCAN_INTERVAL_SEC)
