import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search } from 'lucide-react'

// All 114 surahs — name, English name, number of ayahs, revelation type
const SURAHS = [
    [1, 'الفاتحة', 'Al-Fatiha', 7, 'مكية'], [2, 'البقرة', 'Al-Baqara', 286, 'مدنية'], [3, 'آل عمران', 'Ali \'Imran', 200, 'مدنية'],
    [4, 'النساء', 'An-Nisa', 176, 'مدنية'], [5, 'المائدة', 'Al-Ma\'ida', 120, 'مدنية'], [6, 'الأنعام', 'Al-An\'am', 165, 'مكية'],
    [7, 'الأعراف', 'Al-A\'raf', 206, 'مكية'], [8, 'الأنفال', 'Al-Anfal', 75, 'مدنية'], [9, 'التوبة', 'At-Tawba', 129, 'مدنية'],
    [10, 'يونس', 'Yunus', 109, 'مكية'], [11, 'هود', 'Hud', 123, 'مكية'], [12, 'يوسف', 'Yusuf', 111, 'مكية'],
    [13, 'الرعد', 'Ar-Ra\'d', 43, 'مدنية'], [14, 'إبراهيم', 'Ibrahim', 52, 'مكية'], [15, 'الحجر', 'Al-Hijr', 99, 'مكية'],
    [16, 'النحل', 'An-Nahl', 128, 'مكية'], [17, 'الإسراء', 'Al-Isra', 111, 'مكية'], [18, 'الكهف', 'Al-Kahf', 110, 'مكية'],
    [19, 'مريم', 'Maryam', 98, 'مكية'], [20, 'طه', 'Ta-Ha', 135, 'مكية'], [21, 'الأنبياء', 'Al-Anbiya', 112, 'مكية'],
    [22, 'الحج', 'Al-Hajj', 78, 'مدنية'], [23, 'المؤمنون', 'Al-Mu\'minun', 118, 'مكية'], [24, 'النور', 'An-Nur', 64, 'مدنية'],
    [25, 'الفرقان', 'Al-Furqan', 77, 'مكية'], [26, 'الشعراء', 'Ash-Shu\'ara', 227, 'مكية'], [27, 'النمل', 'An-Naml', 93, 'مكية'],
    [28, 'القصص', 'Al-Qasas', 88, 'مكية'], [29, 'العنكبوت', 'Al-\'Ankabut', 69, 'مكية'], [30, 'الروم', 'Ar-Rum', 60, 'مكية'],
    [31, 'لقمان', 'Luqman', 34, 'مكية'], [32, 'السجدة', 'As-Sajda', 30, 'مكية'], [33, 'الأحزاب', 'Al-Ahzab', 73, 'مدنية'],
    [34, 'سبأ', 'Saba', 54, 'مكية'], [35, 'فاطر', 'Fatir', 45, 'مكية'], [36, 'يس', 'Ya-Sin', 83, 'مكية'],
    [37, 'الصافات', 'As-Saffat', 182, 'مكية'], [38, 'ص', 'Sad', 88, 'مكية'], [39, 'الزمر', 'Az-Zumar', 75, 'مكية'],
    [40, 'غافر', 'Ghafir', 85, 'مكية'], [41, 'فصلت', 'Fussilat', 54, 'مكية'], [42, 'الشورى', 'Ash-Shura', 53, 'مكية'],
    [43, 'الزخرف', 'Az-Zukhruf', 89, 'مكية'], [44, 'الدخان', 'Ad-Dukhan', 59, 'مكية'], [45, 'الجاثية', 'Al-Jathiya', 37, 'مكية'],
    [46, 'الأحقاف', 'Al-Ahqaf', 35, 'مكية'], [47, 'محمد', 'Muhammad', 38, 'مدنية'], [48, 'الفتح', 'Al-Fath', 29, 'مدنية'],
    [49, 'الحجرات', 'Al-Hujurat', 18, 'مدنية'], [50, 'ق', 'Qaf', 45, 'مكية'], [51, 'الذاريات', 'Adh-Dhariyat', 60, 'مكية'],
    [52, 'الطور', 'At-Tur', 49, 'مكية'], [53, 'النجم', 'An-Najm', 62, 'مكية'], [54, 'القمر', 'Al-Qamar', 55, 'مكية'],
    [55, 'الرحمن', 'Ar-Rahman', 78, 'مدنية'], [56, 'الواقعة', 'Al-Waqi\'a', 96, 'مكية'], [57, 'الحديد', 'Al-Hadid', 29, 'مدنية'],
    [58, 'المجادلة', 'Al-Mujadila', 22, 'مدنية'], [59, 'الحشر', 'Al-Hashr', 24, 'مدنية'], [60, 'الممتحنة', 'Al-Mumtahana', 13, 'مدنية'],
    [61, 'الصف', 'As-Saf', 14, 'مدنية'], [62, 'الجمعة', 'Al-Jumu\'a', 11, 'مدنية'], [63, 'المنافقون', 'Al-Munafiqun', 11, 'مدنية'],
    [64, 'التغابن', 'At-Taghabun', 18, 'مدنية'], [65, 'الطلاق', 'At-Talaq', 12, 'مدنية'], [66, 'التحريم', 'At-Tahrim', 12, 'مدنية'],
    [67, 'الملك', 'Al-Mulk', 30, 'مكية'], [68, 'القلم', 'Al-Qalam', 52, 'مكية'], [69, 'الحاقة', 'Al-Haqqah', 52, 'مكية'],
    [70, 'المعارج', 'Al-Ma\'arij', 44, 'مكية'], [71, 'نوح', 'Nuh', 28, 'مكية'], [72, 'الجن', 'Al-Jinn', 28, 'مكية'],
    [73, 'المزمل', 'Al-Muzzammil', 20, 'مكية'], [74, 'المدثر', 'Al-Muddaththir', 56, 'مكية'], [75, 'القيامة', 'Al-Qiyama', 40, 'مكية'],
    [76, 'الإنسان', 'Al-Insan', 31, 'مدنية'], [77, 'المرسلات', 'Al-Mursalat', 50, 'مكية'], [78, 'النبأ', 'An-Naba', 40, 'مكية'],
    [79, 'النازعات', 'An-Nazi\'at', 46, 'مكية'], [80, 'عبس', '\'Abasa', 42, 'مكية'], [81, 'التكوير', 'At-Takwir', 29, 'مكية'],
    [82, 'الانفطار', 'Al-Infitar', 19, 'مكية'], [83, 'المطففين', 'Al-Mutaffifin', 36, 'مكية'], [84, 'الانشقاق', 'Al-Inshiqaq', 25, 'مكية'],
    [85, 'البروج', 'Al-Buruj', 22, 'مكية'], [86, 'الطارق', 'At-Tariq', 17, 'مكية'], [87, 'الأعلى', 'Al-A\'la', 19, 'مكية'],
    [88, 'الغاشية', 'Al-Ghashiya', 26, 'مكية'], [89, 'الفجر', 'Al-Fajr', 30, 'مكية'], [90, 'البلد', 'Al-Balad', 20, 'مكية'],
    [91, 'الشمس', 'Ash-Shams', 15, 'مكية'], [92, 'الليل', 'Al-Layl', 21, 'مكية'], [93, 'الضحى', 'Ad-Duhaa', 11, 'مكية'],
    [94, 'الشرح', 'Ash-Sharh', 8, 'مكية'], [95, 'التين', 'At-Tin', 8, 'مكية'], [96, 'العلق', 'Al-\'Alaq', 19, 'مكية'],
    [97, 'القدر', 'Al-Qadr', 5, 'مكية'], [98, 'البينة', 'Al-Bayyina', 8, 'مدنية'], [99, 'الزلزلة', 'Az-Zalzala', 8, 'مدنية'],
    [100, 'العاديات', 'Al-\'Adiyat', 11, 'مكية'], [101, 'القارعة', 'Al-Qari\'a', 11, 'مكية'], [102, 'التكاثر', 'At-Takathur', 8, 'مكية'],
    [103, 'العصر', 'Al-\'Asr', 3, 'مكية'], [104, 'الهمزة', 'Al-Humaza', 9, 'مكية'], [105, 'الفيل', 'Al-Fil', 5, 'مكية'],
    [106, 'قريش', 'Quraysh', 4, 'مكية'], [107, 'الماعون', 'Al-Ma\'un', 7, 'مكية'], [108, 'الكوثر', 'Al-Kawthar', 3, 'مكية'],
    [109, 'الكافرون', 'Al-Kafirun', 6, 'مكية'], [110, 'النصر', 'An-Nasr', 3, 'مدنية'], [111, 'المسد', 'Al-Masad', 5, 'مكية'],
    [112, 'الإخلاص', 'Al-Ikhlas', 4, 'مكية'], [113, 'الفلق', 'Al-Falaq', 5, 'مكية'], [114, 'الناس', 'An-Nas', 6, 'مكية'],
] as const

export default function SurahBrowserPage() {
    const navigate = useNavigate()
    const [query, setQuery] = useState('')

    const filtered = SURAHS.filter(([num, ar, en]) =>
        String(num).includes(query) ||
        ar.includes(query) ||
        en.toLowerCase().includes(query.toLowerCase())
    )

    return (
        <div className="max-w-2xl mx-auto animate-fade-in-up pb-10">
            {/* Header */}
            <div className="flex items-center justify-between pt-4 px-2 mb-6">
                <button onClick={() => navigate('/')} className="btn-ghost px-3 py-2 rounded-xl text-sm" dir="rtl">
                    ❮ رجوع
                </button>
                <h1 className="text-lg font-bold" dir="rtl">تصفح المصحف</h1>
                <div className="w-20" />
            </div>

            {/* Search */}
            <div className="px-4 mb-5">
                <div className="relative">
                    <Search size={16} className="absolute right-3 top-1/2 -translate-y-1/2 opacity-40" />
                    <input
                        type="text"
                        placeholder="ابحث عن سورة..."
                        value={query}
                        onChange={e => setQuery(e.target.value)}
                        dir="rtl"
                        className="w-full glass rounded-xl px-4 py-3 pr-10 text-sm outline-none placeholder:opacity-40"
                        style={{ fontFamily: 'Cairo, sans-serif' }}
                    />
                </div>
            </div>

            {/* Surah list */}
            <div className="px-4 space-y-2">
                {filtered.map(([num, ar, en, ayahs, type]) => (
                    <button
                        key={num}
                        onClick={() => navigate(`/surah/${num}?mode=read_only`)}
                        className="w-full glass rounded-xl px-4 py-3 flex items-center justify-between hover:border-[var(--color-gold)] border border-transparent transition-colors group"
                        dir="rtl"
                    >
                        {/* Left: number badge */}
                        <div
                            className="flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold ml-3"
                            style={{ background: 'rgba(201,162,39,0.12)', color: 'var(--color-gold)', fontFamily: 'Cairo, sans-serif' }}
                        >
                            {num}
                        </div>
                        {/* Center: names */}
                        <div className="flex-1 text-right">
                            <div className="font-bold text-base" style={{ fontFamily: 'Scheherazade New, serif' }}>{ar}</div>
                            <div className="text-xs opacity-50">{en}</div>
                        </div>
                        {/* Right side: ayah count + type */}
                        <div className="flex-shrink-0 text-left mr-2 text-xs opacity-50 space-y-0.5">
                            <div>{ayahs} آية</div>
                            <div
                                style={{
                                    color: type === 'مكية' ? 'var(--color-gold)' : 'var(--color-emerald)',
                                    opacity: 0.85,
                                }}
                            >{type}</div>
                        </div>
                    </button>
                ))}
            </div>
        </div>
    )
}
