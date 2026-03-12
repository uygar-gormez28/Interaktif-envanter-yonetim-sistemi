#  İnteraktif Belediye IT Envanter Yönetimi

Bilgi İşlem müdürlüğünde staj yaptığım dönem farkettiğim bir soruna yönelik geliştirddiğim bu proje, kurum içindeki bilişim cihazlarının yönetimini ve geçmiş kayıtlarını tek bir merkezden, interaktif biçimde yönetmek için geliştirilmiş modern bir otomasyon sistemidir.


##  Problem

Klasik IT yönetim süreçlerinde bir personel, cihazların aktiflik durumunu kontrol etmek, kimde hangi özelliklerde PC olduğunu bilmek veya arızaları teyit etmek için **her gün tüm katları ve müdürlükleri tek tek gezmek** zorunda kalmaktadır. 

Ayrıca "Geçen ay bu bilgisayarın RAM'ini kim değiştirmişti?", "Bu makine neden depoda bekliyor?" gibi soruları yanıtlamak, klasik Excel veya kağıt dökümleriyle adeta bir kabustur. Zaman ve iş gücü israfı kaçınılmazdır.

##  Çözüm 

IT personelinin kat kat gezme ihtiyacını ortadan kaldıran; müdürlük bazlı, **akıllı ve canlı** bir envanter sistemi geliştirdik. Sistem şunları sağlar:
- **Merkezi Görünürlük:** Cihazların hangi katta, hangi ip adresiyle ve hangi arıza durumuyla bulunduğu anlık olarak ekranınızda.
- **Donanım Arşivi (Zaman Makinesi):** Bir bilgisayarın işlemcisi veya belleği değiştiğinde; değişikliğin yapıldığı tarihi ve donanımın *önceki* halini kalıcı olarak sistemde -bir snapshot şeklinde- tutar.
- **Akıllı Arama:** Sadece arama barıyla saniyeler içinde müdürlükleri bulabilme imkânı.



##  Temel Özellikler

1. **Dinamik Müdürlük Seçimi:** 10+ Farklı müdürlüğe anında ulaşın ve içerideki eksiksiz döküme erişin.
2. **Dashboard & İstatistikler:** O departmanda toplam kaç bilgisayar var, kaçı "Aktif", "Pasif" veya "Arızalı"? Hepsini modern kartlarda görüntüleyin.
3. **Detaylı Özellik Kartları:** PC'ye tıklayarak İşlemci, RAM, Depolama, ve Ekran Kartı gibi kritik bileşenleri gözden geçirin.
4. **Cihaz Geçmişi ve Snapshot Dönüşü:** Donanım yükseltmesi sonrası not eklediğinizde sistem bilgisayarın o anki "eski kimliğini" ve tarihçesini kaydeder.
5. **Modern UI/UX:** Tailwind CSS ve Glassmorphism ile bezenmiş, kusursuz animasyonlu arayüz tasarımı.


##  Kullanılan Teknolojiler

- **Frontend:** React (TypeScript), Tailwind CSS, Vite, Axios, React Icons
- **Backend:** Python, FastAPI, Uvicorn, JSON



