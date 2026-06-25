import { NextPage } from "next";

const Privacy: NextPage = () => {
  return (
    <main style={{ maxWidth: 800, margin: "auto", padding: "2rem", fontFamily: "system-ui, -apple-system, sans-serif", lineHeight: "1.6", color: "#333" }}>
      <h1 style={{ borderBottom: "2px solid #00A95C", paddingBottom: "0.5rem", color: "#00A95C" }}>Politique de confidentialité – RimTransport</h1>

      <p>
        La présente politique de confidentialité explique quelles informations nous collectons, comment nous les utilisons et comment vous pouvez les gérer. Nous accordons une importance primordiale à la protection de vos données personnelles et à votre vie privée.
      </p>

      <h2>1. Informations collectées</h2>
      <p>Nous collectons uniquement les informations nécessaires au bon fonctionnement du service de covoiturage. Ces données incluent :</p>
      <ul>
        <li><strong>Informations d'identification :</strong> Nom et prénom.</li>
        <li><strong>Informations de contact :</strong> Numéro de téléphone (utilisé comme identifiant principal pour la connexion et pour permettre la mise en relation entre chauffeurs et passagers) et adresse e-mail (facultative).</li>
        <li><strong>Photo de profil :</strong> Choisie et importée par vos soins depuis la galerie de votre appareil pour personnaliser votre compte.</li>
        <li><strong>Détails des trajets :</strong> Villes de départ, villes d'arrivée, dates, heures et détails des véhicules (saisis manuellement par l’utilisateur).</li>
        <li><strong>Données d'utilisation :</strong> Fonctionnalités utilisées et journaux d'activité internes pour résoudre les problèmes techniques.</li>
      </ul>
      <p><em>Note : Notre application ne collecte pas de données de localisation GPS en arrière-plan ou en premier plan via des capteurs de géolocalisation. Toutes les informations de localisation (villes) sont saisies manuellement par les utilisateurs.</em></p>

      <h2>2. Utilisation des informations</h2>
      <ul>
        <li>Fournir et améliorer les fonctionnalités de l’application (recherche, publication et réservation de trajets).</li>
        <li>Permettre la mise en relation sécurisée entre passagers et chauffeurs (appels téléphoniques ou messages initiés par l'utilisateur).</li>
        <li>Communiquer avec les utilisateurs (notifications de réservations, alertes de voyage, mises à jour importantes).</li>
        <li>Analyser l’utilisation et résoudre les problèmes techniques pour optimiser les performances.</li>
      </ul>

      <h2>3. Partage et sécurité des données</h2>
      <p><strong>Nous ne vendons, ne louons et ne partageons aucune de vos données personnelles</strong> à des tiers ou à des courtiers de données à des fins publicitaires ou de ciblage. Les seules informations partagées sont celles nécessaires à la mise en relation de covoiturage (affichage de votre prénom et numéro de téléphone pour les personnes liées à votre réservation).</p>

      <h2>4. Publicité et Suivi (Tracking)</h2>
      <p>Notre application est totalement exempte de trackers publicitaires. <strong>Nous n'effectuons aucun suivi (tracking)</strong> de vos activités sur d'autres applications ou sites web tiers. Nous n'utilisons pas l'identifiant publicitaire (IDFA / Advertising ID) de votre appareil.</p>

      <h2>5. Sécurité</h2>
      <p>Nous prenons des mesures de sécurité rigoureuses pour protéger vos informations personnelles contre tout accès non autorisé, altération, divulgation ou destruction.</p>

      <h2>6. Vos droits et Suppression du compte</h2>
      <p>Conformément aux réglementations sur la protection des données et aux directives de l'App Store, vous disposez d'un contrôle total sur vos données :</p>
      <ul>
        <li><strong>Modification :</strong> Vous pouvez mettre à jour vos informations personnelles (nom, téléphone, photo) à tout moment depuis vos paramètres de profil dans l'application.</li>
        <li><strong>Suppression définitive du compte :</strong> Vous pouvez supprimer votre compte et toutes les données qui y sont associées directement depuis l'application mobile en allant sur <strong>Profil -> Supprimer le compte</strong>. Cette action est instantanée et irréversible : elle effacera définitivement de nos serveurs votre profil, vos numéros de téléphone, vos photos, vos véhicules enregistrés, vos trajets publiés et vos réservations.</li>
      </ul>

      <h2>7. Contact</h2>
      <p>
        Pour toute question concernant cette politique de confidentialité ou pour exercer vos droits, contactez-nous à : <a href="mailto:contact@rimtransport.com">contact@rimtransport.com</a>
      </p>
    </main>
  );
};

export default Privacy;
