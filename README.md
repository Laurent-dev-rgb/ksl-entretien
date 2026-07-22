# KSL Entretien

Site officiel de la division Entretien de KSL Conseils & Services S.E.N.C.

## Avant le déploiement

Modifier `config.js` :

```js
window.KSL_CONFIG = {
  email: "votre-courriel",
  phoneDisplay: "418 000-0000",
  phoneE164: "+14180000000",
  whatsappE164: "14180000000"
};
```

## Déploiement Cloudflare Pages

- Framework preset : `None`
- Build command : vide
- Build output directory : `/`
- Domaine personnalisé : `entretien.kslsolutionquebec.ca`
