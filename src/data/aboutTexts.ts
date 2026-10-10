import type { EraTexts } from '../types/models';

/**
 * The texts of the eras of the About page (LOT 3, A3: Corentin's texts, validated). Imported by the
 * About chunk alone (LOT 6): the shared bundle keeps only the eras themselves (content.about.timeline:
 * labels, titles, dates, colours). One paragraph per line; links written [label](https://…).
 */
export const eraTexts = {
    past: `Né aux Sables-d'Olonne, j'ai grandi à la campagne. J'ai toujours été attiré par les activités qui stimulent mon raisonnement et ma logique. Que ce soient les sciences, la cinématographie, les échecs ou les jeux vidéo, ces passions ont façonné mon esprit analytique. Mon entourage familial et amical a été important pour moi et m'a aidé à garder les pieds sur terre.
Passionné par les sports, à l'âge de 12 ans j'ai commencé à pratiquer le rugby à XV au [Rugby Club Sablais (R.C.S.)](https://rc-sablais.ffr.fr/). Cette expérience au niveau national m'a enseigné la discipline, la cohésion d'équipe et la persévérance, des valeurs qui m'accompagnent encore aujourd'hui.
Après avoir obtenu un baccalauréat général scientifique, j'ai exploré diverses voies professionnelles. J'ai entamé une formation en école d'ergothérapie puis j'ai finalement travaillé comme serveur et barman dans l'hôtellerie-restauration. Enfin, je suis devenu informaticien développeur.`,
    present: `Actuellement, je suis détenteur d'un bachelor informatique délivré par le CNAM et je collabore au sein d'une petite ESN. Je consacre la majeure partie de mon temps à travailler et à acquérir un maximum de compétences dans ce domaine. Je partage ma vie avec ma compagne, qui me soutient énormément dans mes projets. Retrouvez mon parcours sur [LinkedIn](https://www.linkedin.com/in/corentin-fanic-832630293).`,
    future: `J'aimerais faire une carrière utile grâce à mes compétences et expériences en tant que [DevOps](https://www.opiiec.fr/metiers/139882-specialiste-devops#:~:text=Finalit%C3%A9%20du%20m%C3%A9tier,monitoring%20des%20performances%20des%20applications). Ce domaine me permet de m'éclater, ce qui me donne la détermination nécessaire pour atteindre mon objectif. Plutôt qu'un diplôme de plus, je fais le choix de l'expérience\u00a0: accumuler les projets concrets, maîtriser les subtilités du monde du travail et gravir les échelons autant que possible.
Mon objectif à long terme est de gérer un SI complet ou d'être responsable de projet de développement.`,
} satisfies EraTexts;
