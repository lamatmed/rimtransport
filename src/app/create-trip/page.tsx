"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { tripService } from "@/services/tripService";
import { carService } from "@/services/carService";
import { authService } from "@/services/authService";
import { useLanguage } from "@/providers/LanguageProvider";
import { Calendar as CalendarIcon, Clock, ArrowLeft, Car as CarIcon, CheckCircle, Plus } from "lucide-react";
import Link from "next/link";

export default function CreateTripPage() {
  const [departureCity, setDepartureCity] = useState("");
  const [arrivalCity, setArrivalCity] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [price, setPrice] = useState("");
  const [seats, setSeats] = useState("");
  const [cars, setCars] = useState<any[]>([]);
  const [selectedCar, setSelectedCar] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [fetchingCars, setFetchingCars] = useState(true);
  const [paymentScreenshotFile, setPaymentScreenshotFile] = useState<File | null>(null);
  const [paymentScreenshotPreview, setPaymentScreenshotPreview] = useState<string | null>(null);
  
  const router = useRouter();
  const { t, locale } = useLanguage();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const user = await authService.getCurrentUser();
      if (!user) {
        router.push("/login");
        return;
      }
      
      const p: any = await authService.getProfile(user.id);
      if (!p || p.role !== 'driver') {
        alert(t('only_drivers_can_create'));
        router.back();
        return;
      }

      const c = await carService.getDriverCars(user.id);
      setCars(c);
      if (c.length > 0) setSelectedCar(c[0].id);
    } catch (e) {
      console.error(e);
    } finally {
      setFetchingCars(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPaymentScreenshotFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPaymentScreenshotPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const calculatedFee = price ? (parseFloat(price) * 4 * 0.05).toFixed(2) : "0";

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!departureCity || !arrivalCity || !price || !seats || !selectedCar || !date || !time) {
      alert(t('fill_all_fields'));
      return;
    }

    if (!paymentScreenshotFile) {
      alert(t('upload_trip_screenshot'));
      return;
    }

    setLoading(true);
    try {
      const user = await authService.getCurrentUser();
      const dateTime = new Date(`${date}T${time}`);
      const feeAmount = (parseFloat(price) * 4) * 0.05;

      let storageId = "";
      if (paymentScreenshotFile) {
        const uploadUrl = await authService.generateProfilePhotoUploadUrl();
        const response = await fetch(uploadUrl, {
          method: "POST",
          headers: { "Content-Type": paymentScreenshotFile.type },
          body: paymentScreenshotFile,
        });
        const data = await response.json();
        storageId = data.storageId;
      }
      
      await tripService.createTrip({
        driver_id: user?.id,
        car_id: selectedCar,
        departure_city: departureCity,
        arrival_city: arrivalCity,
        date: dateTime.getTime(),
        price: parseFloat(price),
        available_seats: parseInt(seats),
        feeAmount: feeAmount,
        paymentScreenshotStorageId: storageId,
      });
      
      alert(t('trip_pending_approval'));
      router.push("/");
    } catch (e: any) {
      alert(e.message || t('publish_trip_failed'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fade-in" style={{ padding: "1.5rem 1.25rem 6rem 1.25rem" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "2rem" }}>
        <button onClick={() => router.back()} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--foreground)" }}>
          <ArrowLeft size={24} />
        </button>
        <h1 style={{ fontSize: "1.25rem", fontWeight: "800" }}>{t('create_trip')}</h1>
        <div style={{ width: "24px" }} />
      </div>

      <form onSubmit={handleCreate} style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
        <div className="card-premium" style={{ padding: "1.5rem" }}>
          <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", textAlign: "center", marginBottom: "1.5rem" }}>{t('form_subtitle')}</p>
          
          <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              <label style={{ fontSize: "0.85rem", fontWeight: "600", color: "var(--text-muted)" }}>{t('departure_city_label')}</label>
              <input 
                type="text" 
                placeholder={t('departure_city_placeholder')} 
                style={{ background: "var(--background)", padding: "1rem", borderRadius: "12px", border: "1px solid var(--border-color)", outline: "none" }}
                value={departureCity}
                onChange={(e) => setDepartureCity(e.target.value)}
              />
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              <label style={{ fontSize: "0.85rem", fontWeight: "600", color: "var(--text-muted)" }}>{t('arrival_city_label')}</label>
              <input 
                type="text" 
                placeholder={t('arrival_city_placeholder')} 
                style={{ background: "var(--background)", padding: "1rem", borderRadius: "12px", border: "1px solid var(--border-color)", outline: "none" }}
                value={arrivalCity}
                onChange={(e) => setArrivalCity(e.target.value)}
              />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                <label style={{ fontSize: "0.85rem", fontWeight: "600", color: "var(--text-muted)" }}>{t('date')}</label>
                <input 
                  type="date" 
                  style={{ background: "var(--background)", padding: "1rem", borderRadius: "12px", border: "1px solid var(--border-color)", outline: "none" }}
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                <label style={{ fontSize: "0.85rem", fontWeight: "600", color: "var(--text-muted)" }}>{t('time')}</label>
                <input 
                  type="time" 
                  style={{ background: "var(--background)", padding: "1rem", borderRadius: "12px", border: "1px solid var(--border-color)", outline: "none" }}
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                />
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                <label style={{ fontSize: "0.85rem", fontWeight: "600", color: "var(--text-muted)" }}>{t('price')} (MRU)</label>
                <input 
                  type="number" 
                  placeholder={t('price_placeholder')} 
                  style={{ background: "var(--background)", padding: "1rem", borderRadius: "12px", border: "1px solid var(--border-color)", outline: "none" }}
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                />
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                <label style={{ fontSize: "0.85rem", fontWeight: "600", color: "var(--text-muted)" }}>{t('available_seats')}</label>
                <input 
                  type="number" 
                  placeholder={t('seats_placeholder')} 
                  style={{ background: "var(--background)", padding: "1rem", borderRadius: "12px", border: "1px solid var(--border-color)", outline: "none" }}
                  value={seats}
                  onChange={(e) => setSeats(e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <h3 style={{ fontSize: "1.1rem", fontWeight: "800", marginLeft: "4px" }}>{t('choose_vehicle')}</h3>
          
          {fetchingCars ? (
            <p style={{ textAlign: "center", padding: "1rem" }}>...</p>
          ) : cars.length === 0 ? (
            <div style={{ textAlign: "center", padding: "2rem" }}>
               <CarIcon size={48} color="var(--primary-green)" style={{ margin: "0 auto 1rem", opacity: 0.5 }} />
               <p style={{ fontWeight: "600" }}>{t('no_car_registered')}</p>
               <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginBottom: "1.5rem" }}>{t('add_car_to_create_trip')}</p>
               <Link href="/my-cars" className="btn-primary" style={{ textDecoration: "none" }}>{t('add_vehicle_btn')}</Link>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              {cars.map((car) => {
                const isSelected = selectedCar === car.id;
                return (
                  <div 
                    key={car.id} 
                    onClick={() => setSelectedCar(car.id)}
                    style={{ 
                      padding: "1rem", 
                      borderRadius: "16px", 
                      border: "2px solid", 
                      borderColor: isSelected ? "var(--primary-green)" : "var(--border-color)",
                      background: isSelected ? "rgba(0, 169, 92, 0.05)" : "var(--card-bg)",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: "1rem",
                      transition: "all 0.2s"
                    }}
                  >
                    <div style={{ width: "40px", height: "40px", borderRadius: "50%", background: isSelected ? "var(--primary-green)" : "rgba(0,0,0,0.05)", display: "flex", alignItems: "center", justifyContent: "center", color: isSelected ? "white" : "inherit" }}>
                      <CarIcon size={20} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <p style={{ fontWeight: "700", color: isSelected ? "var(--primary-green)" : "inherit" }}>{car.brand}</p>
                      <p style={{ fontSize: "0.8rem", color: isSelected ? "var(--primary-green)" : "var(--text-muted)" }}>{car.plate_number}</p>
                    </div>
                    <div style={{ textAlign: "right", display: "flex", alignItems: "center", gap: "8px" }}>
                       <span style={{ fontSize: "0.85rem", fontWeight: "600" }}>{car.seats} {t('places')}</span>
                       {isSelected && <CheckCircle size={20} color="var(--primary-green)" />}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {price && (
          <div className="fade-in" style={{ padding: "1.5rem", background: "rgba(0, 169, 92, 0.05)", borderRadius: "20px", border: "1px dashed var(--primary-green)" }}>
            <h3 style={{ fontSize: "1rem", fontWeight: "700", color: "var(--primary-green)", marginBottom: "0.5rem" }}>{t('trip_payment_title')}</h3>
            <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginBottom: "1rem" }}>{t('trip_payment_desc', { amount: calculatedFee })}</p>
            
            <div style={{ background: "white", padding: "0.8rem", borderRadius: "10px", marginBottom: "1.25rem", border: "1px solid var(--border-color)" }}>
              <p style={{ fontSize: "0.85rem", fontWeight: "600" }}>{t('trip_payment_instructions', { amount: calculatedFee })}</p>
            </div>

            <label style={{ cursor: "pointer", width: "100%", display: "block" }}>
              <input type="file" accept="image/*" onChange={handleFileChange} style={{ display: "none" }} />
              <div style={{ border: "2px dashed var(--border-color)", borderRadius: "12px", padding: "1rem", textAlign: "center", background: paymentScreenshotPreview ? "white" : "transparent" }}>
                {paymentScreenshotPreview ? (
                  <img src={paymentScreenshotPreview} style={{ maxWidth: "100%", maxHeight: "150px", borderRadius: "8px" }} alt="Payment Screenshot" />
                ) : (
                  <div style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>
                    <Plus size={24} color="var(--primary-green)" style={{ margin: "0 auto 4px" }} />
                    <p style={{ fontWeight: "600", color: "var(--primary-green)" }}>{t('upload_trip_screenshot')}</p>
                  </div>
                )}
              </div>
            </label>
          </div>
        )}

        <button type="submit" className="btn-primary" disabled={loading || cars.length === 0} style={{ width: "100%", padding: "1.25rem", marginTop: "1rem" }}>
          {loading ? "..." : t('publish_trip')}
        </button>
      </form>
    </div>
  );
}
