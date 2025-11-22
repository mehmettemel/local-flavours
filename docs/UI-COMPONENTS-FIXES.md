# UI Components - Bilinen Sorunlar ve Çözümler

Bu dosya UI component'lerinde karşılaşılan sorunları ve çözümlerini içerir.

## 📌 İçindekiler

- [Combobox - Dialog İçinde Scroll Sorunu](#combobox-dialog-içinde-scroll-sorunu)

---

## Combobox - Dialog İçinde Scroll Sorunu

### 🔴 Sorun
Combobox component'i bir Dialog içinde kullanıldığında:
- Dropdown açılıyor ama scroll çalışmıyor
- Seçeneklere tıklanamıyor
- Mouse event'leri çalışmıyor

### 💡 Neden Oluşuyor?
Radix UI'ın Dialog ve Popover component'leri arasında **focus trap** ve **event handling** çakışması var. Dialog, Popover'ın portal positioning ve event handling'ini engelliyor.

### ✅ Çözüm

**İlgili Dosya:** `components/ui/combobox.tsx`

İki düzeltme yapıldı:

#### 1. Popover'a `modal={true}` prop'u eklendi:
```tsx
<Popover open={open} onOpenChange={setOpen} modal={true}>
```

#### 2. PopoverContent'e `pointerEvents: 'auto'` style'ı eklendi:
```tsx
<PopoverContent
  className="p-0"
  align="start"
  sideOffset={4}
  style={{
    width: triggerWidth ? `${triggerWidth}px` : 'auto',
    pointerEvents: 'auto'
  }}
>
```

### 📚 Kaynak
- GitHub Issue: https://github.com/shadcn-ui/ui/issues/4277
- Çözüm thread'de 10+ upvote almış
- Alternatif: Portal'ı kaldırmak (ama daha invaziv)

### 🔧 Kullanım Örneği
```tsx
// ✅ Artık dialog içinde çalışıyor
<Dialog open={open} onOpenChange={setOpen}>
  <DialogContent>
    <Combobox
      options={categories}
      value={categoryId}
      onValueChange={setCategoryId}
      placeholder="Kategori seçin..."
    />
  </DialogContent>
</Dialog>
```

---

## 📝 Notlar

- Bu dosyaya benzer UI component sorunları ve çözümleri eklenecek
- Her sorun için: Neden oluşuyor, nasıl çözülüyor, kaynak linkler
- Component'ler güncellenirken bu çözümlerin korunmasına dikkat edilmeli

---

**Son Güncelleme:** 2025-01-22
**Toplam Çözüm:** 1
