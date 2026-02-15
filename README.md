# WatchArchive

İzlediğin film ve dizileri takip edebileceğin kişisel arşiv uygulaması.

## Özellikler

- Film ve dizi ekleme (TMDB API ile arama)
- İzlenen içerikleri listeleme ve arama
- Film / dizi filtresi
- Günlük izlenme tarihi ekleme
- localStorage ile kalıcı kayıt (tarayıcıda saklanır)

## TMDB API Anahtarı

Film ve dizi araması için [TMDB](https://www.themoviedb.org/) ücretsiz API anahtarı gerekir:

1. [TMDB hesabı oluşturun](https://www.themoviedb.org/signup)
2. [API ayarlarından](https://www.themoviedb.org/settings/api) API key alın
3. `.env.local` dosyasına ekleyin: `TMDB_API_KEY=your_api_key_here`

## Başlangıç

Önce Node.js kurulu olduğundan emin olun. [Node.js indir](https://nodejs.org/)

Ardından bağımlılıkları yükleyin ve geliştirme sunucusunu başlatın:

```bash
npm install
npm run dev
```

Tarayıcıda [http://localhost:3000](http://localhost:3000) adresini açın.

## Komutlar

- `npm run dev` - Geliştirme sunucusunu başlat (Turbopack ile)
- `npm run build` - Production build al
- `npm run start` - Production sunucusunu başlat
- `npm run lint` - ESLint ile kod kontrolü
