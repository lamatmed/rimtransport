// pages/privacy.tsx
import { NextPage } from "next";

const Privacy: NextPage = () => {
  return (
    <main style={{ maxWidth: 800, margin: "auto", padding: "2rem" }}>
      <h1>Politique de confidentialité – RimTransport</h1>

      <p>
        La présente politique de confidentialité explique quelles informations nous collectons, comment nous les utilisons et comment vous pouvez les gérer.
      </p>

      <h2>1. Informations collectées</h2>
      <ul>
        <li>Nom et prénom (si fournis)</li>
        <li>Adresse e-mail</li>
        <li>Données liées à l’utilisation de l’application (fonctionnalités utilisées, journaux d’activité)</li>
        <li>Données de localisation (si l’utilisateur autorise l’accès)</li>
      </ul>

      <h2>2. Utilisation des informations</h2>
      <ul>
        <li>Fournir et améliorer les fonctionnalités de l’application</li>
        <li>Communiquer avec les utilisateurs (notifications, mises à jour importantes)</li>
        <li>Analyser l’utilisation et résoudre les problèmes techniques</li>
      </ul>

      <h2>3. Partage des informations</h2>
      <p>Nous ne vendons ni ne louons vos informations personnelles. Nous pouvons partager des données anonymisées pour des statistiques ou des analyses internes.</p>

      <h2>4. Publicité et identifiant publicitaire</h2>
      <p>Nous n’utilisons pas l’identifiant publicitaire (Advertising ID) pour le ciblage publicitaire, sauf si spécifié dans l’application.</p>

      <h2>5. Sécurité</h2>
      <p>Nous prenons des mesures raisonnables pour protéger vos informations personnelles contre tout accès non autorisé, modification ou divulgation.</p>

      <h2>6. Vos droits</h2>
      <p>Vous pouvez demander la modification ou la suppression de vos informations en nous contactant via l’adresse e-mail fournie dans l’application.</p>

      <h2>7. Contact</h2>
      <p>
        Pour toute question concernant cette politique de confidentialité, contactez-nous à : <a href="mailto:contact@rimtransport.com">contact@rimtransport.com</a>
      </p>
    </main>
  );
};

export default Privacy;