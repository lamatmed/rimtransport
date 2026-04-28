"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { authService } from "@/services/authService";
import { carService } from "@/services/carService";
import { tripService } from "@/services/tripService";
import { reservationService } from "@/services/reservationService";
import { useLanguage } from "@/providers/LanguageProvider";
import { 
  User, 
  Car, 
  Settings, 
  HelpCircle, 
  LogOut, 
  ChevronRight, 
  Award, 
  Clock, 
  Users, 
  Phone, 
  Camera,
  Edit2,
  Shield,
  Lock,
  X,
  CheckCircle
} from "lucide-react";

type RelatedPerson = { id: string; name: string; phone: string };

export default function ProfilePage() {
  const [profile, setProfile] = useState<any>(null);
  const [relatedPeople, setRelatedPeople] = useState<RelatedPerson[]>([]);
  const [activityCount, setActivityCount] = useState(0);
  const [carsCount, setCarsCount] = useState(0);
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  
  const [editName, setEditName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [saving, setSaving] = useState(false);
  
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [changingPassword, setChangingPassword] = useState(false);
  
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  
  const router = useRouter();
  const { t, locale, setLocale } = useLanguage();

  const mauritaniaGreen = '#00A95C';
  const mauritaniaGold = '#FFD700';
  const mauritaniaRed = '#C60C30';

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const user = await authService.getCurrentUser();
      if (!user) {
        router.push('/login');
        return;
      }
      const data: any = await authService.getProfile(user.id);
      setProfile(data);
      setEditName(data?.name ?? '');
      setEditPhone(data?.phone ?? '');
      setEditEmail(data?.email ?? '');
      await loadRelatedInsights(data);
    } catch (e) {
      console.error(e);
    }
  };

  const loadRelatedInsights = async (p: any) => {
    const id = p._id || p.id;
    if (!id) return;
    try {
      if (p.role === 'driver') {
        const cars = await carService.getDriverCars(id);
        setCarsCount(cars.length);
        const reservations = await reservationService.getDriverReservations(id);
        const byId = new Map<string, RelatedPerson>();
        for (const r of reservations) {
          const passenger = r.profiles;
          if (passenger?.id && passenger.name) {
            byId.set(String(passenger.id), {
              id: String(passenger.id),
              name: passenger.name,
              phone: passenger.phone ?? '—',
            });
          }
        }
        setRelatedPeople([...byId.values()]);
        // Note: For total trips, we might need a getDriverTrips in tripService
        const trips = await tripService.listTrips(); 
        setActivityCount(trips.filter((t: any) => t.driver_id === id).length);
      } else {
        const trips = await tripService.listTrips();
        setCarsCount(trips.length);
        const reservations = await reservationService.getUserReservations(id);
        const byId = new Map<string, RelatedPerson>();
        for (const r of reservations) {
          const driver = r.trips?.profiles;
          if (driver?.id && driver.name) {
            byId.set(String(driver.id), {
              id: String(driver.id),
              name: driver.name,
              phone: driver.phone ?? '—',
            });
          }
        }
        setRelatedPeople([...byId.values()]);
        setActivityCount(reservations.length);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleLogout = async () => {
    if (confirm(t('logout_confirm_msg'))) {
      await authService.signOut();
      router.push('/login');
    }
  };

  const handleToggleLanguage = () => {
    const next = locale === 'fr' ? 'ar' : 'fr';
    setLocale(next);
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile?.id && !profile?._id) return;

    setSaving(true);
    try {
      const updated = await authService.updateProfile((profile?._id || profile?.id) as any, {
        name: editName,
        phone: editPhone,
        email: editEmail,
      });
      setProfile(updated);
      alert(t('info_updated'));
      setShowInfoModal(false);
    } catch (e) {
      alert(t('update_profile_failed'));
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) return alert(t('passwords_dont_match'));

    setChangingPassword(true);
    try {
      await authService.changePassword(profile?._id || profile?.id, oldPassword, newPassword);
      alert(t('password_changed_success'));
      setShowPasswordModal(false);
      setOldPassword(''); setNewPassword(''); setConfirmPassword('');
    } catch (e: any) {
      alert(e.message || t('op_failed'));
    } finally {
      setChangingPassword(false);
    }
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !profile) return;

    setUploadingPhoto(true);
    try {
      const uploadUrl = await authService.generateProfilePhotoUploadUrl();
      const uploadResponse = await fetch(uploadUrl, {
        method: 'POST',
        headers: { 'Content-Type': file.type },
        body: file,
      });
      const { storageId } = await uploadResponse.json();
      const updated = await authService.setProfilePhoto(profile._id || profile.id, storageId);
      setProfile(updated);
      alert(t('photo_updated'));
    } catch (e) {
      alert(t('update_photo_failed'));
    } finally {
      setUploadingPhoto(false);
    }
  };

  const formatMemberDuration = (value: any) => {
    if (!value) return '--';
    const createdDate = new Date(value);
    const now = Date.now();
    const diffMs = Math.max(0, now - createdDate.getTime());
    const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (days < 30) return `${days} ${days > 1 ? t('days') : t('day')}`;
    const months = Math.floor(days / 30);
    if (months < 12) return `${months} ${t('months')}`;
    const years = Math.floor(months / 12);
    return `${years} ${years > 1 ? t('years') : t('year')}`;
  };

  return (
    <div className="fade-in" style={{ padding: "1.5rem 0 6rem 0" }}>
      {/* Premium Header */}
      <div style={{ background: "linear-gradient(180deg, var(--primary-green) 0%, #008a4b 100%)", borderRadius: "0 0 30px 30px", padding: "3rem 1.25rem 4rem 1.25rem", marginTop: "-1.5rem", textAlign: "center", color: "white" }}>
        <div style={{ position: "relative", width: "110px", height: "110px", margin: "0 auto 1.5rem" }}>
          <div style={{ width: "100%", height: "100%", borderRadius: "50%", border: `3px solid ${mauritaniaGold}`, padding: "3px" }}>
            <div style={{ width: "100%", height: "100%", borderRadius: "50%", background: "rgba(255,255,255,0.2)", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
              {profile?.photoUrl ? (
                <img src={profile.photoUrl} alt="Profile" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              ) : (
                <User size={48} />
              )}
            </div>
          </div>
          <label style={{ position: "absolute", bottom: "0", right: "0", background: "white", padding: "6px", borderRadius: "50%", boxShadow: "var(--shadow)", cursor: "pointer" }}>
            <Camera size={16} color="var(--primary-green)" />
            <input type="file" hidden accept="image/*" onChange={handlePhotoUpload} disabled={uploadingPhoto} />
          </label>
        </div>
        
        <h1 style={{ fontSize: "1.75rem", fontWeight: "800", marginBottom: "0.5rem" }}>{profile?.name || "..." }</h1>
        <div style={{ display: "inline-flex", alignItems: "center", background: "rgba(255,255,255,0.2)", padding: "4px 12px", borderRadius: "20px", fontSize: "0.75rem", fontWeight: "700", marginBottom: "1rem" }}>
          {profile?.role === 'admin' || profile?.email === 'admin@gmail.mr' ? (
            <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
              <Shield size={14} color={mauritaniaGold} />
              {t('admin_title').toUpperCase()}
            </span>
          ) : profile?.role === 'driver' ? (
            `🚗 ${t('role_driver').toUpperCase()}`
          ) : (
            `👤 ${t('role_passenger').toUpperCase()}`
          )}
        </div>
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: "8px", fontSize: "0.9rem" }}>
          <Phone size={14} /> <span>{profile?.phone}</span>
        </div>
      </div>

      {/* Stats Section */}
      <div style={{ display: "flex", gap: "10px", padding: "0 1.25rem", marginTop: "-2rem", marginBottom: "2rem" }}>
        {profile?.role !== 'admin' && profile?.email !== 'admin@gmail.mr' ? (
          <>
            <StatCard icon={<Car size={20} color={mauritaniaGold} />} value={String(carsCount)} label={profile?.role === 'driver' ? t('vehicles') : t('available_trips')} />
            <StatCard icon={<Award size={20} color={mauritaniaGold} />} value={String(activityCount)} label={profile?.role === 'driver' ? t('trips') : t('reservations')} />
          </>
        ) : (
          <StatCard icon={<Shield size={20} color={mauritaniaGold} />} value="MASTER" label={t('admin_title')} />
        )}
        <StatCard icon={<Clock size={20} color={mauritaniaGold} />} value={formatMemberDuration(profile?._creationTime)} label={t('member')} />
      </div>

      {/* Related Insights */}
      {/* Related Insights */}
      {profile?.role !== 'admin' && profile?.email !== 'admin@gmail.mr' && (
        <div style={{ padding: "0 1.25rem", marginBottom: "2rem" }}>
          <h3 style={{ fontSize: "1.1rem", fontWeight: "800", marginBottom: "1rem" }}>{profile?.role === 'driver' ? t('passengers_on_trips') : t('drivers_on_trips')}</h3>
          <div className="card-premium" style={{ padding: "1.25rem" }}>
             <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "1rem", color: "var(--text-muted)" }}>
               <Users size={20} color="var(--primary-green)" />
               <span style={{ fontSize: "0.9rem" }}>{relatedPeople.length} {profile?.role === 'driver' ? t('unique_passengers') : t('unique_drivers')}</span>
             </div>
             {relatedPeople.length === 0 ? (
               <p style={{ textAlign: "center", fontSize: "0.85rem", color: "var(--text-muted)", padding: "1rem" }}>{profile?.role === 'driver' ? t('no_driver_res') : t('no_passenger_res')}</p>
             ) : (
               <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                 {relatedPeople.slice(0, 3).map(person => (
                   <div key={person.id} style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                     <div style={{ width: "36px", height: "36px", borderRadius: "50%", background: "rgba(0,169,92,0.1)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--primary-green)" }}>
                       <User size={18} />
                     </div>
                     <div style={{ flex: 1 }}>
                       <p style={{ fontWeight: "600", fontSize: "0.9rem" }}>{person.name}</p>
                       <p style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>{person.phone}</p>
                     </div>
                   </div>
                 ))}
               </div>
             )}
          </div>
        </div>
      )}

      {/* Options Sections */}
      <div style={{ padding: "0 1.25rem" }}>
        <h3 style={{ fontSize: "1.1rem", fontWeight: "800", marginBottom: "1rem" }}>{t('account')}</h3>
        <div className="card-premium" style={{ overflow: "hidden" }}>
          <ProfileOption icon={<User size={20} color="var(--primary-green)" />} title={t('personal_info')} onClick={() => setShowInfoModal(true)} />
          {profile?.email === "admin@gmail.mr" && <ProfileOption icon={<Shield size={20} color="var(--primary-green)" />} title={t('admin_title')} onClick={() => router.push('/admin')} />}
          {profile?.role === 'driver' && <ProfileOption icon={<Car size={20} color="var(--primary-green)" />} title={t('my_cars')} onClick={() => router.push('/my-cars')} />}
          <ProfileOption icon={<Settings size={20} color="var(--primary-green)" />} title={t('language')} onClick={handleToggleLanguage} badge={locale.toUpperCase()} />
          <ProfileOption icon={<Lock size={20} color="var(--primary-green)" />} title={t('change_password')} onClick={() => setShowPasswordModal(true)} />
        </div>

        <h3 style={{ fontSize: "1.1rem", fontWeight: "800", marginBottom: "1rem", marginTop: "2rem" }}>{t('support')}</h3>
        <div className="card-premium" style={{ overflow: "hidden" }}>
          <ProfileOption icon={<HelpCircle size={20} color="var(--primary-green)" />} title={t('help_support')} onClick={() => router.push('/help')} />
          <ProfileOption icon={<LogOut size={20} color={mauritaniaRed} />} title={t('logout')} onClick={handleLogout} showChevron={false} color={mauritaniaRed} />
        </div>
        
        <p style={{ textAlign: "center", fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "2rem" }}>Version 1.1.0 (Next.js PWA)</p>
      </div>

      {/* Modals */}
      {showInfoModal && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.5)", zIndex: 1000, display: "flex", alignItems: "flex-end" }}>
          <div className="fade-in" style={{ width: "100%", maxWidth: "600px", margin: "0 auto", background: "white", borderTopLeftRadius: "24px", borderTopRightRadius: "24px", padding: "2rem 2rem 100px 2rem", maxHeight: "90vh", overflowY: "auto" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
              <h2 style={{ fontSize: "1.25rem", fontWeight: "800" }}>{t('personal_info')}</h2>
              <button onClick={() => setShowInfoModal(false)} style={{ background: "none", border: "none", cursor: "pointer" }}><X /></button>
            </div>
            <form onSubmit={handleSaveProfile} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
               <div style={{ textAlign: "center", marginBottom: "1rem" }}>
                 <div style={{ width: "80px", height: "80px", margin: "0 auto 10px", borderRadius: "50%", background: "rgba(0,169,92,0.1)", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
                   {profile?.photoUrl ? <img src={profile.photoUrl} alt="Preview" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <User size={30} color="var(--primary-green)" />}
                 </div>
                 <label style={{ fontSize: "0.85rem", color: "var(--primary-green)", fontWeight: "700", cursor: "pointer" }}>
                   {uploadingPhoto ? "..." : t('change_photo')}
                   <input type="file" hidden accept="image/*" onChange={handlePhotoUpload} />
                 </label>
               </div>
               <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                 <label style={{ fontSize: "0.85rem", fontWeight: "700" }}>{t('fullname_label')}</label>
                 <input type="text" value={editName} onChange={e => setEditName(e.target.value)} style={{ padding: "1rem", borderRadius: "12px", border: "1px solid var(--border-color)", outline: "none" }} />
               </div>
               <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                 <label style={{ fontSize: "0.85rem", fontWeight: "700" }}>{t('phone_label')}</label>
                 <input type="tel" value={editPhone} onChange={e => setEditPhone(e.target.value)} style={{ padding: "1rem", borderRadius: "12px", border: "1px solid var(--border-color)", outline: "none" }} />
               </div>
               <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                 <label style={{ fontSize: "0.85rem", fontWeight: "700" }}>{t('email_label')}</label>
                 <input type="email" value={editEmail} onChange={e => setEditEmail(e.target.value)} style={{ padding: "1rem", borderRadius: "12px", border: "1px solid var(--border-color)", outline: "none" }} placeholder={t('email_placeholder')} />
               </div>
               <button className="btn-primary" disabled={saving} style={{ padding: "1.1rem", marginTop: "1rem" }}>{saving ? "..." : t('save')}</button>
            </form>
          </div>
        </div>
      )}

      {showPasswordModal && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.5)", zIndex: 1000, display: "flex", alignItems: "flex-end" }}>
          <div className="fade-in" style={{ width: "100%", maxWidth: "600px", margin: "0 auto", background: "white", borderTopLeftRadius: "24px", borderTopRightRadius: "24px", padding: "2rem 2rem 100px 2rem", maxHeight: "90vh", overflowY: "auto" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
              <h2 style={{ fontSize: "1.25rem", fontWeight: "800" }}>{t('change_password')}</h2>
              <button onClick={() => setShowPasswordModal(false)} style={{ background: "none", border: "none", cursor: "pointer" }}><X /></button>
            </div>
            <form onSubmit={handleChangePassword} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
               <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                 <label style={{ fontSize: "0.85rem", fontWeight: "700" }}>{t('current_password')}</label>
                 <input type="password" value={oldPassword} onChange={e => setOldPassword(e.target.value)} style={{ padding: "1rem", borderRadius: "12px", border: "1px solid var(--border-color)", outline: "none" }} placeholder="••••••••" />
               </div>
               <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                 <label style={{ fontSize: "0.85rem", fontWeight: "700" }}>{t('new_password')}</label>
                 <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} style={{ padding: "1rem", borderRadius: "12px", border: "1px solid var(--border-color)", outline: "none" }} placeholder="••••••••" />
               </div>
               <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                 <label style={{ fontSize: "0.85rem", fontWeight: "700" }}>{t('confirm_new_password')}</label>
                 <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} style={{ padding: "1rem", borderRadius: "12px", border: "1px solid var(--border-color)", outline: "none" }} placeholder="••••••••" />
               </div>
               <button className="btn-primary" disabled={changingPassword} style={{ padding: "1.1rem", marginTop: "1rem" }}>{changingPassword ? "..." : t('save')}</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ icon, value, label }: any) {
  return (
    <div style={{ flex: 1, background: "white", padding: "1.25rem 0.5rem", borderRadius: "20px", textAlign: "center", boxShadow: "var(--shadow)" }}>
      <div style={{ marginBottom: "8px", display: "flex", justifyContent: "center" }}>{icon}</div>
      <p style={{ fontSize: "1.25rem", fontWeight: "800", color: "var(--primary-green)", marginBottom: "4px" }}>{value}</p>
      <p style={{ fontSize: "0.65rem", color: "var(--text-muted)", fontWeight: "600", textTransform: "uppercase" }}>{label}</p>
    </div>
  );
}

function ProfileOption({ icon, title, onClick, showChevron = true, color = "var(--foreground)", badge }: any) {
  return (
    <div onClick={onClick} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "1.1rem 1.25rem", borderBottom: "1px solid rgba(0,0,0,0.05)", cursor: "pointer" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
        <div style={{ width: "36px", height: "36px", borderRadius: "10px", background: "rgba(0,169,92,0.1)", display: "flex", alignItems: "center", justifyContent: "center" }}>
          {icon}
        </div>
        <div style={{ position: "relative" }}>
          <span style={{ fontWeight: "600", fontSize: "1rem", color }}>{title}</span>
          {badge && <span style={{ marginLeft: "8px", fontSize: "0.65rem", background: "var(--primary-green)", color: "white", padding: "2px 6px", borderRadius: "10px" }}>{badge}</span>}
        </div>
      </div>
      {showChevron && <ChevronRight size={18} color="var(--text-muted)" />}
    </div>
  );
}
