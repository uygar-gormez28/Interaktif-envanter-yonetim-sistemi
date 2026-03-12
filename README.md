# 🏢 İnteraktif Belediye IT Envanter Yönetimi

Bu proje, kurum içindeki bilişim cihazlarının yönetimini ve geçmiş kayıtlarını tek bir merkezden, interaktif biçimde yönetmek için geliştirilmiş modern bir otomasyon sistemidir.

<div align="center">
  <img src="C:/Users/uygrg/.gemini/antigravity/brain/43a108f1-3a51-476a-a69b-2b3327121e4a/department_search_1773276894550.png" width="600" alt="Müdürlük Arama Ekranı" style="border-radius: 10px; margin-bottom: 20px; box-shadow: 0 4px 8px rgba(0,0,0,0.1);" />
</div>

## 🚨 Problem

Klasik IT yönetim süreçlerinde bir personel, cihazların aktiflik durumunu kontrol etmek, kimde hangi özelliklerde PC olduğunu bilmek veya arızaları teyit etmek için **her gün tüm katları ve müdürlükleri tek tek gezmek** zorunda kalmaktadır. 

Ayrıca "Geçen ay bu bilgisayarın RAM'ini kim değiştirmişti?", "Bu makine neden depoda bekliyor?" gibi soruları yanıtlamak, klasik Excel veya kağıt dökümleriyle adeta bir kabustur. Zaman ve iş gücü israfı kaçınılmazdır.

## 💡 Çözüm 

IT personelinin kat kat gezme ihtiyacını ortadan kaldıran; müdürlük bazlı, **akıllı ve canlı** bir envanter sistemi geliştirdik. Sistem şunları sağlar:
- **Merkezi Görünürlük:** Cihazların hangi katta, hangi ip adresiyle ve hangi arıza durumuyla bulunduğu anlık olarak ekranınızda.
- **Donanım Arşivi (Zaman Makinesi):** Bir bilgisayarın işlemcisi veya belleği değiştiğinde; değişikliğin yapıldığı tarihi ve donanımın *önceki* halini kalıcı olarak sistemde -bir snapshot şeklinde- tutar.
- **Akıllı Arama:** Sadece arama barıyla saniyeler içinde müdürlükleri bulabilme imkânı.

<div align="center">
  <img src="C:/Users/uygrg/.gemini/antigravity/brain/43a108f1-3a51-476a-a69b-2b3327121e4a/inventory_dashboard_1773276878082.png" width="600" alt="Müdürlük İstatistikleri ve PC Listesi" style="border-radius: 10px; margin-bottom: 20px; box-shadow: 0 4px 8px rgba(0,0,0,0.1);" />
</div>

## ✨ Temel Özellikler

1. **Dinamik Müdürlük Seçimi:** 10+ Farklı müdürlüğe anında ulaşın ve içerideki eksiksiz döküme erişin.
2. **Dashboard & İstatistikler:** O departmanda toplam kaç bilgisayar var, kaçı "Aktif", "Pasif" veya "Arızalı"? Hepsini modern kartlarda görüntüleyin.
3. **Detaylı Özellik Kartları:** PC'ye tıklayarak İşlemci, RAM, Depolama, ve Ekran Kartı gibi kritik bileşenleri gözden geçirin.
4. **Cihaz Geçmişi ve Snapshot Dönüşü:** Donanım yükseltmesi sonrası not eklediğinizde sistem bilgisayarın o anki "eski kimliğini" ve tarihçesini kaydeder.
5. **Modern UI/UX:** Tailwind CSS ve Glassmorphism ile bezenmiş, kusursuz animasyonlu arayüz tasarımı.

<div align="center">
  <img src="<img width="1507" height="691" alt="image" src="https://github.com/user-attachments/assets/7d27d761-bae2-4362-b2ee-708572a789f5" />
" style="border-radius: 10px; margin-bottom: 20px; box-shadow: 0 4px 8px rgba(0,0,0,0.1);" />
</div>

## 🛠 Kullanılan Teknolojiler

- **Frontend:** React (TypeScript), Tailwind CSS, Vite, Axios, React Icons
- **Backend:** Python, FastAPI, Uvicorn, JSON

## 🚀 Kurulum & Çalıştırma

### 1️⃣ Backend'i Başlatmak İçin:
REST API servisimiz Python FastAPI tarafından desteklenmektedir. Verileri okumak ve güncellemek için kullanılır.
```bash
cd backend
# Gerekliyse FastAPI kurulumu: pip install fastapi uvicorn
uvicorn main:app --reload
