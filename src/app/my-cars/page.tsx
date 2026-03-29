"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { carService } from "@/services/carService";
import { authService } from "@/services/authService";
import { useLanguage } from "@/providers/LanguageProvider";
import { Car as CarIcon, Trash2, PlusCircle, Wind, Briefcase, Wifi, Music, PawPrint, X, ArrowLeft, CheckCircle, ChevronRight } from "lucide-react";

export default function MyCarsPage() {
  const [cars, setCars] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingCar, setEditingCar] = useState<any>(null);
  const [viewingCar, setViewingCar] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const router = useRouter();
  const { t } = useLanguage();

  useEffect(() => { loadCars(); }, []);

  const loadCars = async () => {
    try {
      const user = await authService.getCurrentUser();
      if (user) {
        const c = await carService.getDriverCars(user.id);
        setCars(c);
      } else {
        router.push("/login");
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm(t('are_you_sure'))) {
      try {
        await carService.deleteCar(id);
        loadCars();
      } catch (e: any) {
        alert(e.message);
      }
    }
  };

  return (
    <div className="fade-in" style={{ padding: "1.5rem 0 6rem 0" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
        <h1 style={{ fontSize: "1.5rem", fontWeight: "800" }}>{t('my_vehicles')}</h1>
        <button 
          onClick={() => { setEditingCar(null); setShowForm(true); }}
          className="btn-primary" 
          style={{ padding: "0.6rem 1.25rem", borderRadius: "20px", fontSize: "0.85rem", gap: "6px" }}
        >
          <PlusCircle size={18} /> {t('add')}
        </button>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        {loading ? (
          <div style={{ textAlign: "center", padding: "2rem" }}>...</div>
        ) : cars.length === 0 ? (
          <div style={{ textAlign: "center", padding: "4rem 2rem", background: "var(--card-bg)", borderRadius: "20px", border: "1px dashed var(--border-color)" }}>
            <CarIcon size={48} color="var(--primary-green)" style={{ opacity: 0.3, marginBottom: "1rem" }} />
            <p style={{ color: "var(--text-muted)" }}>{t('no_vehicles_yet')}</p>
          </div>
        ) : (
          cars.map((car) => (
            <div key={car.id} className="card-premium" style={{ padding: "1.25rem" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "1rem" }}>
                <div style={{ width: "44px", height: "44px", borderRadius: "12px", background: "rgba(0,169,92,0.1)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--primary-green)" }}>
                  <CarIcon size={22} />
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontWeight: "700", fontSize: "1.1rem" }}>{car.brand}</p>
                  <p style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>{car.plate_number}</p>
                  <p style={{ fontSize: "0.75rem", color: "var(--primary-green)", fontWeight: "600" }}>{car.seats} {t('places')}</p>
                </div>
              </div>
              
              <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginBottom: "1.25rem" }}>
                {car.has_ac && <OptionChip icon={<Wind size={12}/>} label={t('ac')} />}
                {car.has_luggage && <OptionChip icon={<Briefcase size={12}/>} label={t('luggage')} />}
                {car.has_wifi && <OptionChip icon={<Wifi size={12}/>} label={t('wifi')} />}
                {car.has_music && <OptionChip icon={<Music size={12}/>} label={t('music')} />}
                {car.is_pet_friendly && <OptionChip icon={<PawPrint size={12}/>} label={t('pets')} />}
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "1rem", paddingTop: "1rem", borderTop: "1px solid var(--border-color)" }}>
                <button onClick={() => setViewingCar(car)} style={{ background: "none", border: "none", color: "var(--primary-green)", fontWeight: "700", fontSize: "0.85rem", cursor: "pointer" }}>{t('view_details')}</button>
                <button onClick={() => { setEditingCar(car); setShowForm(true); }} style={{ background: "none", border: "none", color: "var(--primary-green)", fontWeight: "700", fontSize: "0.85rem", cursor: "pointer" }}>{t('edit')}</button>
                <button onClick={() => handleDelete(car.id)} style={{ background: "none", border: "none", color: "var(--error)", cursor: "pointer" }}><Trash2 size={18} /></button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Car Form Modal */}
      {showForm && (
        <CarForm 
          initialCar={editingCar} 
          onClose={() => { setShowForm(false); setEditingCar(null); }} 
          onSuccess={loadCars} 
        />
      )}

      {/* Viewing Car Details Modal */}
      {viewingCar && (
        <CarDetailsModal 
          car={viewingCar} 
          onClose={() => setViewingCar(null)} 
        />
      )}
    </div>
  );
}

function OptionChip({ icon, label }: any) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "4px", padding: "4px 10px", borderRadius: "20px", border: "1px solid rgba(0,169,92,0.3)", background: "rgba(0,169,92,0.05)", color: "var(--primary-green)", fontSize: "0.7rem", fontWeight: "700" }}>
      {icon} <span>{label}</span>
    </div>
  );
}

function CarForm({ initialCar, onClose, onSuccess }: any) {
  const { t } = useLanguage();
  const [brand, setBrand] = useState(initialCar?.brand || "");
  const [plate, setPlate] = useState(initialCar?.plate_number || "");
  const [seats, setSeats] = useState(initialCar?.seats || "");
  const [hasAC, setHasAC] = useState(initialCar?.has_ac || false);
  const [hasLuggage, setHasLuggage] = useState(initialCar?.has_luggage || false);
  const [hasWifi, setHasWifi] = useState(initialCar?.has_wifi || false);
  const [hasMusic, setHasMusic] = useState(initialCar?.has_music || false);
  const [isPetFriendly, setIsPetFriendly] = useState(initialCar?.is_pet_friendly || false);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!brand || !plate || !seats) return alert(t('fill_required_fields'));

    setSubmitting(true);
    try {
      const user = await authService.getCurrentUser();
      if (initialCar) {
        await carService.updateCar(initialCar.id, {
          brand, plate_number: plate, seats: parseInt(seats),
          has_ac: hasAC, has_luggage: hasLuggage, has_wifi: hasWifi,
          has_music: hasMusic, is_pet_friendly: isPetFriendly
        });
      } else {
        await carService.createCar({
          driver_id: user?.id,
          brand, plate_number: plate, seats: parseInt(seats),
          has_ac: hasAC, has_luggage: hasLuggage, has_wifi: hasWifi,
          has_music: hasMusic, is_pet_friendly: isPetFriendly
        });
      }
      onSuccess();
      onClose();
    } catch (e: any) {
      alert(e.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "white", zIndex: 1200, overflowY: "auto", padding: "1.5rem 1.5rem 100px 1.5rem" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "2rem" }}>
        <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer" }}><ArrowLeft size={24} /></button>
        <h2 style={{ fontSize: "1.25rem", fontWeight: "800" }}>{initialCar ? t('edit_vehicle') : t('add_vehicle')}</h2>
        <div style={{ width: "24px" }} />
      </div>

      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
          <label style={{ fontSize: "0.85rem", fontWeight: "700" }}>{t('brand_model')} *</label>
          <input type="text" value={brand} onChange={(e) => setBrand(e.target.value)} style={{ padding: "1rem", borderRadius: "12px", border: "1px solid var(--border-color)", outline: "none" }} />
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
          <label style={{ fontSize: "0.85rem", fontWeight: "700" }}>{t('plate_number')} *</label>
          <input type="text" value={plate} onChange={(e) => setPlate(e.target.value)} style={{ padding: "1rem", borderRadius: "12px", border: "1px solid var(--border-color)", outline: "none" }} />
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
          <label style={{ fontSize: "0.85rem", fontWeight: "700" }}>{t('number_of_seats')} *</label>
          <input type="number" value={seats} onChange={(e) => setSeats(e.target.value)} style={{ padding: "1rem", borderRadius: "12px", border: "1px solid var(--border-color)", outline: "none" }} />
        </div>

        <h3 style={{ fontSize: "0.75rem", fontWeight: "800", textTransform: "uppercase", color: "var(--text-muted)", marginTop: "1rem" }}>{t('vehicle_options')}</h3>
        <div style={{ display: "flex", flexDirection: "column", background: "rgba(0,0,0,0.02)", borderRadius: "16px", border: "1px solid var(--border-color)" }}>
          <SwitchRow label={t('air_conditioner')} value={hasAC} onChange={setHasAC} icon={<Wind size={18}/>} />
          <SwitchRow label={t('luggage_comp')} value={hasLuggage} onChange={setHasLuggage} icon={<Briefcase size={18}/>} />
          <SwitchRow label={t('wifi_onboard')} value={hasWifi} onChange={setHasWifi} icon={<Wifi size={18}/>} />
          <SwitchRow label={t('audio_system_short')} value={hasMusic} onChange={setHasMusic} icon={<Music size={18}/>} />
          <SwitchRow label={t('pets_allowed')} value={isPetFriendly} onChange={setIsPetFriendly} icon={<PawPrint size={18}/>} isLast />
        </div>

        <button className="btn-primary" disabled={submitting} style={{ width: "100%", padding: "1.1rem", marginTop: "1.5rem" }}>{submitting ? "..." : t('save_vehicle')}</button>
        <button type="button" onClick={onClose} style={{ background: "none", border: "none", color: "var(--primary-green)", fontWeight: "700", padding: "1rem", cursor: "pointer" }}>{t('cancel')}</button>
      </form>
    </div>
  );
}

function SwitchRow({ label, value, onChange, icon, isLast }: any) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "1rem", borderBottom: isLast ? "none" : "1px solid var(--border-color)" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
        <div style={{ color: "var(--primary-green)" }}>{icon}</div>
        <span>{label}</span>
      </div>
      <input type="checkbox" checked={value} onChange={(e) => onChange(e.target.checked)} style={{ width: "40px", height: "20px", cursor: "pointer" }} />
    </div>
  );
}

function CarDetailsModal({ car, onClose }: any) {
  const { t } = useLanguage();
  return (
    <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.5)", zIndex: 3000, display: "flex", alignItems: "flex-end" }}>
      <div className="fade-in" style={{ width: "100%", maxWidth: "600px", margin: "0 auto", background: "white", borderTopLeftRadius: "24px", borderTopRightRadius: "24px", padding: "2rem 2rem 100px 2rem", maxHeight: "85vh", overflowY: "auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
          <h2 style={{ fontSize: "1.4rem", fontWeight: "800" }}>{t('vehicle_details')}</h2>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer" }}><X /></button>
        </div>
        
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
           <div style={{ width: "80px", height: "80px", borderRadius: "40px", background: "rgba(0, 169, 92, 0.1)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 1rem" }}>
              <CarIcon size={32} color="var(--primary-green)" />
           </div>
           <h3 style={{ fontSize: "1.25rem", fontWeight: "800" }}>{car.brand}</h3>
           <p style={{ color: "var(--text-muted)", fontWeight: "600" }}>{car.plate_number}</p>
           <p style={{ color: "var(--primary-green)", fontWeight: "700", marginTop: "4px" }}>{car.seats} {t('all_seats_total')}</p>
        </div>

        <div style={{ background: "#f9f9f9", borderRadius: "16px", padding: "1.5rem", display: "flex", flexDirection: "column", gap: "1.25rem" }}>
           <h4 style={{ fontSize: "1rem", fontWeight: "700" }}>{t('equipments_options')}</h4>
           <DetailRow icon={<Wind size={18}/>} label={t('air_conditioner')} active={car.has_ac} />
           <DetailRow icon={<Briefcase size={18}/>} label={t('luggage_comp')} active={car.has_luggage} />
           <DetailRow icon={<Wifi size={18}/>} label={t('wifi_onboard')} active={car.has_wifi} />
           <DetailRow icon={<Music size={18}/>} label={t('audio_system')} active={car.has_music} />
           <DetailRow icon={<PawPrint size={18}/>} label={t('pets_allowed')} active={car.is_pet_friendly} />
        </div>

        <button onClick={onClose} className="btn-primary" style={{ width: "100%", marginTop: "2rem", padding: "1.1rem" }}>{t('close')}</button>
      </div>
    </div>
  );
}

function DetailRow({ icon, label, active }: any) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "1rem", opacity: active ? 1 : 0.3 }}>
       <div style={{ color: active ? "var(--primary-green)" : "inherit" }}>{icon}</div>
       <span style={{ flex: 1, fontWeight: "500", fontSize: "0.95rem" }}>{label}</span>
       {active && <CheckCircle size={18} color="var(--primary-green)" />}
    </div>
  );
}
