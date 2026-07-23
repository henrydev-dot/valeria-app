import { Router, Response } from 'express';
import { User } from '../models/User';
import { authMiddleware, AuthRequest } from '../middleware/authMiddleware';
import { performCalculations } from '../utils/calculations';
import { ZODIAC_DATA, TURKISH_CITIES } from '../constants';
import { UserInput } from '../types';

const router = Router();

// GET /transits 🔐
router.get('/', authMiddleware, async (req: AuthRequest, res: Response) => {
    try {
        const user = await User.findById(req.user!._id);
        if (!user) return res.status(404).json({ error: 'Kullanıcı bulunamadı', code: 'NOT_FOUND' });

        // Mevcut hesaplama sistemi ile transit hesapla
        const inputData: UserInput = {
            name: user.name,
            birthDate: user.birthDate || '1990-01-01',
            birthTime: user.birthTime || '12:00',
            birthCity: user.birthCity || 'İstanbul',
            latitude: user.latitude || '41.0082',
            longitude: user.longitude || '28.9784',
            gender: user.gender,
            relationshipStatus: user.relationshipStatus,
            jobStatus: user.workStatus
        };

        const calcData = performCalculations(inputData);
        const today = new Date().toISOString().split('T')[0];

        // Transit verilerini req.md formatına dönüştür
        const transits = calcData.astrology.transits.slice(0, 10).map(t => ({
            planet: t.transitPlanet,
            sign: '', // mevcut transit yapısında sign yok, placeholder
            degree: t.orb,
            retrograde: false,
            effect: t.interpretation
        }));

        // Ay fazı hesapla (basit yaklaşım)
        const moonPhases = ['Yeni Ay', 'Hilal', 'İlk Dördün', 'Şişkin Ay', 'Dolunay', 'Azalan Şişkin', 'Son Dördün', 'Azalan Hilal'];
        const dayOfYear = Math.floor((new Date().getTime() - new Date(new Date().getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24));
        const moonPhase = moonPhases[Math.floor((dayOfYear % 29.5) / 3.7)];

        return res.json({
            date: today,
            transits,
            moonPhase,
            generalAdvice: "Bugün gezegenlerin enerjisine uyum sağlayın ve iç sesinizi dinleyin."
        });
    } catch (error: any) {
        console.error('Transits error:', error);
        return res.status(500).json({ error: 'Transit hesaplama hatası', code: 'SERVER_ERROR' });
    }
});

export default router;
