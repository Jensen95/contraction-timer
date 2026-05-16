import type { Messages } from '../types.ts';

const da: Messages = {
  // App
  'app.name': 'Ve-timer',
  // TopBar
  'topbar.laborDuration': 'Fødselstid',
  'topbar.contractionCount': '{n} veer',
  'topbar.openSettings': 'Åbn indstillinger',
  'topbar.languageToggle': 'Skift sprog',
  // BigButton
  'btn.startContraction': 'Start ve',
  'btn.endContraction': 'Afslut ve',
  'btn.tapWhenEnds': 'tryk når den slutter',
  'btn.tapWhenNextStarts': 'tryk når næste begynder',
  'btn.tapWhenBegins': 'tryk når en ve begynder',
  'btn.sinceLast': 'siden sidst',
  'btn.undoLast': '↩ Fortryd sidst',
  'btn.undoLastAria': 'Fortryd seneste handling',
  // StillGoingBanner
  'banner.stillGoing': 'Har du stadig en ve? ({duration}) — tryk Afslut når den er færdig',
  // StatsCard
  'stats.title': 'Fødselsresume',
  'stats.contractions': 'veer (seneste time)',
  'stats.avgInterval': 'gns. interval',
  'stats.avgDuration': 'gns. varighed',
  'stats.laborTime': 'fødselstid',
  'stats.ruleMet': '5-1-1-reglen opfyldt',
  'stats.ruleMetHint': 'Overvej at ringe til din sundhedsperson',
  'stats.ruleSince': 'siden {time}',
  'stats.ruleTitle': '5-1-1-reglen',
  'stats.ruleUnmet': 'Krav: veer hvert ≤5 min, som varer ≥1 min, i 1 time',
  // Tooltips
  'tooltip.contractions':
    'Antal afsluttede veer i de seneste 60 minutter. Dit sundhedsteam bruger dette til at vurdere veernes hyppighed.',
  'tooltip.avgInterval':
    'Gennemsnitlig tid mellem veer. Under aktiv fødsel forkortes intervallerne til ≤5 minutter.',
  'tooltip.avgDuration': 'Gennemsnitlig varighed af hver ve. Veer ≥1 minut indikerer aktiv fødsel.',
  'tooltip.laborTime':
    'Samlet tid siden din første ve. Hjælper dit sundhedsteam med at følge fødselsforløbet.',
  'tooltip.rule511':
    'Veer hvert 5. minut, der varer 1 minut, i 1 time. At opfylde dette er et almindeligt signal om at ringe til din sundhedsperson.',
  // ContractionLog
  'log.title': 'Veelog',
  'log.colStart': 'Start',
  'log.colDuration': 'Varighed',
  'log.colInterval': 'Interval',
  'log.ongoing': 'pågående…',
  'log.editAria': 'Rediger ve {n}',
  // SettingsPanel
  'settings.title': 'Indstillinger',
  'settings.closeAria': 'Luk indstillinger',
  'settings.exportSection': 'Eksport',
  'settings.downloadCsv': 'Download CSV',
  'settings.shareLog': 'Del log',
  'settings.noData': 'Ingen veer registreret endnu.',
  'settings.sessionSection': 'Session',
  'settings.confirmClear': 'Slet alle {n} veer?',
  'settings.yesClear': 'Ja, ryd alt',
  'settings.cancel': 'Annuller',
  'settings.clearAll': 'Ryd alle data',
  'settings.aboutSection': 'Om',
  'settings.aboutText':
    'Ve-timer hjælper med at spore fødselsveer for dit sundhedsteam. Fungerer offline.',
  'settings.themeSection': 'Tema',
  'settings.themeAuto': 'Automatisk',
  'settings.themeLight': 'Lyst',
  'settings.themeDark': 'Mørkt',
  'settings.languageSection': 'Sprog',
  // EditModal
  'edit.title': 'Rediger ve',
  'edit.startTime': 'Starttidspunkt',
  'edit.stillInProgress': 'Stadig i gang',
  'edit.endTime': 'Sluttidspunkt',
  'edit.note': 'Note (valgfri)',
  'edit.notePlaceholder': 'fx vandet gik, tog medicin',
  'edit.save': 'Gem',
  'edit.cancel': 'Annuller',
  'edit.deleteConfirm': 'Slet denne ve?',
  'edit.yesDelete': 'Ja, slet',
  'edit.noKeep': 'Nej, behold den',
  'edit.deleteEntry': 'Slet indgang',
  // App (stale dialog)
  'stale.title': 'Aktiv ve fundet',
  'stale.desc': 'Der var en aktiv ve i gang, da du sidst lukkede denne app. Hvad vil du gøre?',
  'stale.endNow': 'Afslut den nu',
  'stale.discard': 'Kassér den',
  'stale.keepOpen': 'Hold den åben',
};

export default da;
