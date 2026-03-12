const fs = require('fs');
console.log("Started JS fix script...");
try {
  const dbPath = './envanter.json';
  const data = JSON.parse(fs.readFileSync(dbPath, 'utf8'));

  const departments = [
    'Basın',
    'Fen İşleri',
    'Park Bahçeler',
    'Zabıta',
    'Kültür ve Sosyal İşler',
    'İmar ve Şehircilik',
    'Bilgi İşlem',
    'İnsan Kaynakları',
    'Mali Hizmetler',
    'Hukuk İşleri',
    'Destek Hizmetleri',
    'Özel Kalem'
  ];

  const brands = ['Dell OptiPlex 7090', 'HP EliteDesk 800 G6', 'Lenovo ThinkCentre M70q', 'Apple Mac mini', 'Asus ExpertCenter D5'];
  const rams = ['8 GB', '16 GB', '32 GB'];
  const cpus = ['Intel Core i5-10500', 'Intel Core i7-11700', 'Intel Core i9-11900', 'Apple M1'];
  const osList = ['Windows 10 Pro', 'Windows 11 Pro', 'Ubuntu 22.04 LTS', 'macOS Monterey'];
  const strList = ['256 GB SSD', '512 GB SSD', '1 TB NVMe SSD'];
  const gpuList = ['Intel UHD Graphics', 'Intel UHD Graphics 750', 'NVIDIA Quadro P2200 5GB', 'Apple M1 GPU (8-core)'];
  const statuses = ['Aktif', 'Aktif', 'Aktif', 'Pasif', 'Arızalı'];

  let pcCountByDept = {};
  data.forEach(item => {
      pcCountByDept[item.mudurluk] = (pcCountByDept[item.mudurluk] || 0) + 1;
  });

  let maxId = Math.max(...data.map(d => d.id), 0);

  departments.forEach((dept, deptIndex) => {
      let currentCount = pcCountByDept[dept] || 0;
      let targetCount = Math.floor(Math.random() * 6) + 7; // 7-12
      if (dept === 'Basın' && targetCount < 10) targetCount = 10;
      if (dept === 'Zabıta' && targetCount < 7) targetCount = 7;

      if (currentCount < targetCount) {
          let toAdd = targetCount - currentCount;
          for (let i = 0; i < toAdd; i++) {
              maxId++;
              const bIdx = Math.floor(Math.random() * brands.length);
              data.push({
                  id: maxId,
                  marka: brands[bIdx],
                  mudurluk: dept,
                  ip: `192.168.${10 + deptIndex * 5}.${50 + i}`,
                  kat: (deptIndex % 5),
                  ram: rams[Math.floor(Math.random() * rams.length)],
                  cpu: cpus[Math.floor(Math.random() * cpus.length)],
                  isletim_sistemi: osList[Math.floor(Math.random() * osList.length)],
                  depolama: strList[Math.floor(Math.random() * strList.length)],
                  ekran_karti: gpuList[Math.floor(Math.random() * gpuList.length)],
                  durum: statuses[Math.floor(Math.random() * statuses.length)],
                  gecmis: [{ 'tarih': '2024-02-15', 'mesaj': 'Sisteme yeni alım ile eklendi.' }]
              });
          }
      }
  });

  fs.writeFileSync(dbPath, JSON.stringify(data, null, 2), 'utf8');
  console.log("Done adding new items. Total items: " + data.length);
} catch(e) {
  console.error(e);
}
