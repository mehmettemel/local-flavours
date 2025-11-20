# Combobox Styling Guide

Bu döküman, Combobox ve diğer select component'lerinde seçili öğelerin nasıl gösterildiğini açıklar.

## 🎨 Seçili Öğe Gösterimi

### Tasarım Kararı

**Checkbox yerine Background Rengi kullanılıyor**

- ✅ **Daha temiz görünüm**: Checkbox'lar liste görünümünde karmaşa yaratır
- ✅ **Modern UX**: Çoğu modern UI'da (macOS, iOS) background highlight kullanılır
- ✅ **Brand colors**: Turuncu (orange) tema rengi ile tutarlı
- ✅ **Dark mode friendly**: Hem light hem dark mode'da iyi görünür

## 🧩 Implementation

### Combobox Component

```typescript
<CommandItem
  value={option.value}
  onSelect={handleSelect}
  className={cn(
    "cursor-pointer",
    // Seçili öğe için turuncu background
    value === option.value && "bg-orange-100 dark:bg-orange-900/30 text-orange-900 dark:text-orange-100"
  )}
>
  {option.label}
</CommandItem>
```

### Renk Paleti

#### Light Mode
- **Background**: `bg-orange-100` (#FFEDD5)
- **Text**: `text-orange-900` (#7C2D12)
- **Sonuç**: Yumuşak, göze hoş turuncu vurgu

#### Dark Mode
- **Background**: `dark:bg-orange-900/30` (rgba turuncu, %30 opacity)
- **Text**: `dark:text-orange-100` (#FFEDD5)
- **Sonuç**: Karanlık temada da net görünür, göz yormaz

## 📱 Kullanım Yerleri

### 1. Şehir Seçimi (City Select)

```typescript
// components/ui/city-select.tsx
<CommandItem
  value={city.name}
  className={cn(
    "cursor-pointer",
    value === city.name && "bg-orange-100 dark:bg-orange-900/30 text-orange-900 dark:text-orange-100"
  )}
>
  {city.name}
</CommandItem>
```

**Görünüm:**
```
┌─────────────────────────────┐
│ İstanbul                    │
│ ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ │  ← Seçili (turuncu bg)
│ Ankara                      │
│ İzmir                       │
│ Bursa                       │
└─────────────────────────────┘
```

### 2. Kategori Seçimi (Category Select)

```typescript
// components/ui/combobox.tsx
<CommandItem
  value={category.id}
  className={cn(
    "cursor-pointer",
    value === category.id && "bg-orange-100 dark:bg-orange-900/30 text-orange-900 dark:text-orange-100"
  )}
>
  {category.names.tr}
</CommandItem>
```

**Görünüm:**
```
┌─────────────────────────────┐
│ Kebap & Ocakbaşı           │
│ Esnaf Lokantası            │
│ ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ │  ← Seçili (turuncu bg)
│ Pide & Lahmacun            │
│ Burger                      │
└─────────────────────────────┘
```

### 3. Anasayfa Filtreler

Anasayfadaki şehir ve kategori filtreleri de aynı stilleri kullanır:
- Combobox dropdown'larda seçili öğe turuncu
- Button'larda seçili state için `variant="default"` (zaten turuncu)

## 🎯 Consistency (Tutarlılık)

### Tüm Select/Combobox Component'lerinde

Projede şu component'ler bu stili kullanıyor:

1. ✅ `components/ui/combobox.tsx` - Genel combobox
2. ✅ `components/ui/city-select.tsx` - Şehir seçimi
3. ✅ `components/collections/collection-dialog.tsx` - Koleksiyon oluşturma
4. ✅ `components/collections/add-place-dialog.tsx` - Mekan ekleme
5. ✅ `components/collections/edit-collection-modal.tsx` - Koleksiyon düzenleme
6. ✅ `components/leaderboard/places-leaderboard.tsx` - Anasayfa filtreleri

## 🚫 Ne YAPILMAMALI

### ❌ Checkbox Kullanmayın

```typescript
// YANLIŞ - Checkbox ile
<CommandItem>
  <Check className={cn("mr-2 h-4 w-4", isSelected && "opacity-100")} />
  {label}
</CommandItem>
```

Bu yaklaşım:
- Gereksiz visual clutter yaratır
- Mobile'da dokunma alanını küçültür
- Modern UX standartlarına uymaz

### ❌ Farklı Renkler Kullanmayın

```typescript
// YANLIŞ - Brand colors'ı bozar
className={isSelected && "bg-blue-100"}  // ❌
className={isSelected && "bg-green-100"} // ❌
```

Tutarlılık için sadece **turuncu (orange)** kullanın.

## 🎨 Hover States

Seçili olmayan öğeler için hover:

```typescript
// CommandItem zaten default hover state'e sahip
// Ek custom hover istemiyorsanız, className'e eklemeyin
```

Default hover (CommandItem built-in):
- Light mode: hafif gri (`bg-neutral-100`)
- Dark mode: hafif beyaz (`bg-neutral-800`)

## 🌓 Dark Mode

Dark mode'da renklerin opaklığına dikkat edin:

```typescript
// Light mode: solid color
bg-orange-100

// Dark mode: opacity ile
dark:bg-orange-900/30  // %30 opacity
```

Bu yaklaşım:
- Göze daha yumuşak gelir
- Arkadaki dark background'u tamamen örtmez
- Depth/hierarchy oluşturur

## 📐 Spacing & Layout

Seçili öğe için ek padding/margin **eklemeyin**:

```typescript
// DOĞRU
className={isSelected && "bg-orange-100"}

// YANLIŞ - Layout'u bozar
className={isSelected && "bg-orange-100 px-4 py-2"}
```

CommandItem zaten built-in padding'e sahip.

## ✅ Checklist

Yeni bir select/combobox eklerken:

- [ ] Seçili state için turuncu background kullandınız mı?
- [ ] Dark mode variant eklediniz mi?
- [ ] Checkbox kullanmadınız mı?
- [ ] Text rengi de değişiyor mu? (okunabilirlik için)
- [ ] Cursor pointer var mı?
- [ ] Tüm diğer combobox'larla tutarlı mı?

## 🔧 Troubleshooting

### Seçili öğe görünmüyor

**Sorun**: Background değişmiyor

**Çözüm**:
```typescript
// value prop'unu doğru karşılaştırın
value === option.value  // ✅ string === string
value === option.id     // ✅ string === string

// Tip uyumsuzluğu olmasın
value === option.id.toString() // Gerekirse convert edin
```

### Dark mode'da görünmüyor

**Sorun**: Dark mode'da seçili öğe net değil

**Çözüm**:
```typescript
// Opacity'yi artırın
dark:bg-orange-900/30  // %30
dark:bg-orange-900/50  // %50 daha net
```

### Hover ve selected çakışıyor

**Sorun**: Hover state, selected state'i eziyor

**Çözüm**:
```typescript
// Selected state için !important veya daha spesifik selector
className={cn(
  "cursor-pointer",
  value === option.value && "!bg-orange-100 dark:!bg-orange-900/30"
)}
```

---

**Son güncelleme**: 2025-01-20

Tutarlı ve modern bir UX için bu standartları takip edin.
