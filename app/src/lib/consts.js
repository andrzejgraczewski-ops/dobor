// Stałe doboru i formatowanie — przeniesione 1:1 z prototypu v3.
// TERMS to regulamin (13 paragrafów), LOADS/HOURS/ZVALS/TEMPS to wykres
// katalogowy współczynnika pracy fs, reszta to pomocnicze formatowanie liczb.

const CAT=()=>window.DKM_CATALOG||[];
const TERMS=[
  {n:'§ 1',t:'Postanowienia ogólne',p:[
    'Niniejszy Regulamin określa zasady korzystania z aplikacji doboru produktów DKM, zwanej dalej „Aplikacją”.',
    'Operatorem Aplikacji jest DKM Power Transmission Sp. z o.o., ul. 3 Maja 20, 87-640 Czernikowo, NIP 879-268-87-36, dalej „DKM”.',
    'Aplikacja jest narzędziem wspomagającym dobór produktów oferowanych przez DKM Power Transmission Sp. z o.o., w szczególności przekładni, silników oraz kompatybilnych wariantów wykonania.',
    'Korzystanie z Aplikacji oznacza akceptację niniejszego Regulaminu.'],b:[]},
  {n:'§ 2',t:'Przeznaczenie Aplikacji',p:[
    'Aplikacja umożliwia wyszukanie i wstępny dobór produktów na podstawie parametrów określonych przez użytkownika, takich jak w szczególności:'],
    b:['moc silnika','prędkość obrotowa','wymagane przełożenie','wymagany moment obrotowy','typ i wielkość przekładni','wariant przyłącza silnika','inne parametry dostępne w Aplikacji'],
    p2:['Wyniki prezentowane przez Aplikację są generowane na podstawie danych wprowadzonych przez użytkownika, zastosowanych algorytmów obliczeniowych oraz danych technicznych zawartych w bazie DKM.',
    'Wynik Aplikacji należy traktować jako propozycję doboru, a nie jako kompletny projekt techniczny lub potwierdzenie przydatności produktu do każdego możliwego zastosowania.']},
  {n:'§ 3',t:'Obowiązek weryfikacji technicznej',p:[
    'Przed zastosowaniem produktu wskazanego przez Aplikację użytkownik powinien dokonać jego weryfikacji pod kątem rzeczywistych warunków pracy.',
    'Weryfikacja powinna obejmować, odpowiednio do zastosowania, w szczególności:'],
    b:['rzeczywistą moc i moment obrotowy','wymagane przełożenie i prędkość obrotową','współczynnik pracy','czas i charakter pracy','częstotliwość rozruchów','występowanie obciążeń udarowych','obciążenia promieniowe i osiowe','temperaturę otoczenia i warunki środowiskowe','sposób i pozycję montażu','sposób smarowania','współpracę z pozostałymi elementami układu napędowego','wymagania bezpieczeństwa dotyczące maszyny lub instalacji'],
    p2:['Aplikacja może nie uwzględniać wszystkich szczególnych warunków występujących w konkretnym zastosowaniu.',
    'W przypadku zastosowań nietypowych, pracy w pobliżu dopuszczalnych parametrów produktu, obciążeń dynamicznych lub innych szczególnych warunków użytkownik powinien skonsultować dobór z działem działem technicznym DKM Power Transmission Sp. z o.o.']},
  {n:'§ 4',t:'Dane wprowadzane przez użytkownika',p:[
    'Użytkownik odpowiada za prawidłowość, kompletność oraz zgodność ze stanem rzeczywistym danych wprowadzonych do Aplikacji.',
    'Podanie danych błędnych, niepełnych lub nieodpowiadających rzeczywistym warunkom pracy może spowodować wygenerowanie niewłaściwego wyniku.',
    'DKM Power Transmission Sp. z o.o. nie odpowiada za skutki wynikające z zastosowania produktu dobranego na podstawie błędnych lub niepełnych danych dostarczonych przez użytkownika, z zastrzeżeniem bezwzględnie obowiązujących przepisów prawa.'],b:[]},
  {n:'§ 5',t:'Charakter wyniku',p:['Wynik wygenerowany przez Aplikację nie stanowi:'],
    b:['kompletnego projektu technicznego','dokumentacji konstrukcyjnej maszyny','analizy bezpieczeństwa maszyny lub instalacji','oceny ryzyka','oceny zgodności maszyny','obliczeń wytrzymałościowych całego układu','gwarancji osiągnięcia określonych parametrów całej maszyny lub instalacji'],
    p2:['Wynik Aplikacji nie zastępuje wiedzy technicznej projektanta, konstruktora, integratora maszyny ani innych osób odpowiedzialnych za prawidłowy i bezpieczny dobór elementów napędu.',
    'Za ostateczną ocenę przydatności produktu do konkretnego zastosowania odpowiada osoba dokonująca projektu lub integracji układu, w zakresie wynikającym z obowiązujących przepisów prawa.']},
  {n:'§ 6',t:'Dane techniczne',p:[
    'DKM dokłada należytej staranności, aby dane techniczne i obliczeniowe dostępne w Aplikacji były prawidłowe i aktualne.',
    'Ze względu na rozwój produktów, zmiany konstrukcyjne oraz aktualizacje dokumentacji poszczególne dane mogą ulegać zmianie.',
    'W przypadku rozbieżności pomiędzy wynikiem Aplikacji a aktualną dokumentacją techniczną produktu należy dokonać dodatkowej weryfikacji i skontaktować się z DKM Power Transmission Sp. z o.o.',
    'Użytkownik nie powinien opierać decyzji dotyczących bezpieczeństwa maszyny lub instalacji wyłącznie na wyniku wygenerowanym automatycznie przez Aplikację.'],b:[]},
  {n:'§ 7',t:'Odpowiedzialność',p:[
    'DKM Power Transmission Sp. z o.o. odpowiada za funkcjonowanie Aplikacji na zasadach wynikających z obowiązujących przepisów prawa.',
    'DKM Power Transmission Sp. z o.o. nie ponosi odpowiedzialności za skutki zastosowania wyniku Aplikacji bez odpowiedniej weryfikacji technicznej, w szczególności gdy szkoda wynika z:'],
    b:['podania przez użytkownika nieprawidłowych lub niepełnych danych','nieuwzględnienia rzeczywistych warunków pracy','zastosowania produktu poza jego parametrami dopuszczalnymi','nieprawidłowego montażu, uruchomienia, obsługi lub konserwacji','dokonania zmian produktu lub jego zastosowania niezgodnie z dokumentacją','pominięcia dodatkowych obciążeń lub warunków, których Aplikacja nie uwzględnia'],
    p2:['Postanowień niniejszego Regulaminu nie należy interpretować jako wyłączających lub ograniczających odpowiedzialność DKM Power Transmission Sp. z o.o. w przypadkach, w których takie wyłączenie lub ograniczenie jest niedopuszczalne na podstawie obowiązujących przepisów prawa.',
    'Postanowienia niniejszego Regulaminu nie ograniczają ustawowych praw konsumentów ani innych osób korzystających z ochrony przewidzianej bezwzględnie obowiązującymi przepisami prawa.']},
  {n:'§ 8',t:'Dostępność Aplikacji',p:['DKM Power Transmission Sp. z o.o. może okresowo aktualizować, modyfikować lub czasowo wyłączać Aplikację, w szczególności w celu:'],
    b:['aktualizacji danych technicznych','rozszerzenia bazy produktów','usuwania błędów','prowadzenia prac technicznych','poprawy funkcjonalności lub bezpieczeństwa'],
    p2:['DKM Power Transmission Sp. z o.o. nie gwarantuje nieprzerwanego dostępu do Aplikacji.']},
  {n:'§ 9',t:'Prawa własności intelektualnej',p:[
    'Aplikacja, jej kod źródłowy, struktura, sposób działania, baza danych, grafiki, układ interfejsu, opisy, zestawienia oraz materiały opracowane przez DKM Power Transmission Sp. z o.o. stanowią własność DKM Power Transmission Sp. z o.o. albo są wykorzystywane przez DKM na podstawie odpowiednich praw.',
    'Kopiowanie, modyfikowanie, rozpowszechnianie, odsprzedaż, publikowanie lub wykorzystywanie Aplikacji albo jej istotnych elementów w innych systemach bez uprzedniej zgody DKM Power Transmission Sp. z o.o. jest zabronione, z wyjątkiem przypadków dozwolonych przez obowiązujące przepisy prawa.',
    'Wyniki wygenerowane przez Aplikację mogą być wykorzystywane przez użytkownika w związku z doborem i zastosowaniem produktów DKM.',
    'Oznaczenia DKM oraz DKM Power Transmission mogą podlegać ochronie na podstawie właściwych przepisów prawa.'],b:[]},
  {n:'§ 10',t:'Wymagania techniczne',p:[
    'Do korzystania z Aplikacji wymagane jest urządzenie umożliwiające jej uruchomienie oraz aktualne oprogramowanie pozwalające na prawidłowe wyświetlanie i wykonywanie funkcji Aplikacji.',
    'W przypadku wersji internetowej wymagane może być również połączenie z Internetem.',
    'Złożenie zamówienia lub wysłanie zapytania ofertowego wymaga połączenia z Internetem także w wersji offline Aplikacji.'],b:[]},
  {n:'§ 11',t:'Reklamacje i zgłaszanie błędów',p:[
    'Użytkownik może zgłosić nieprawidłowe działanie Aplikacji, błąd w danych technicznych lub inne zastrzeżenia dotyczące jej działania do DKM.',
    'Zgłoszenie powinno, jeżeli jest to możliwe, zawierać:'],
    b:['opis problemu','dane wprowadzone do Aplikacji','wygenerowany wynik','wersję Aplikacji','zrzut ekranu lub wygenerowany dokument'],
    p2:['Zgłoszenia należy kierować na adres sklep@d-k-m.eu. DKM rozpatruje zgłoszenia zgodnie z obowiązującymi przepisami prawa.']},
  {n:'§ 12',t:'Rozpoczęcie i zakończenie korzystania',p:[
    'Korzystanie z Aplikacji jest dobrowolne.',
    'Rozpoczęcie korzystania z funkcji obliczeniowych Aplikacji oznacza rozpoczęcie korzystania z usługi.',
    'Użytkownik może w każdej chwili zakończyć korzystanie z Aplikacji poprzez jej zamknięcie lub opuszczenie strony.'],b:[]},
  {n:'§ 13',t:'Postanowienia końcowe',p:[
    'Regulamin jest dostępny użytkownikowi przed rozpoczęciem korzystania z Aplikacji oraz z poziomu jej interfejsu.',
    'DKM może dokonywać zmian Regulaminu w przypadku zmian funkcjonalności Aplikacji, przepisów prawa, zakresu oferowanych produktów lub zasad świadczenia usługi.',
    'Do korzystania z Aplikacji stosuje się prawo polskie, z zastrzeżeniem bezwzględnie obowiązujących przepisów chroniących użytkownika.',
    'Żadne postanowienie niniejszego Regulaminu nie wyłącza ani nie ogranicza praw użytkownika, których zgodnie z obowiązującymi przepisami prawa nie można wyłączyć ani ograniczyć.'],b:[]}
];
const LOADS=[
  {k:'A',l:'A · równomierne',d:'współczynnik przyspieszenia masy Fa ≤ 0,3',lo:0.8,hi:1.0},
  {k:'B',l:'B · umiarkowane udary',d:'Fa ≤ 3',lo:1.0,hi:1.3},
  {k:'C',l:'C · ciężkie udary',d:'Fa ≤ 10',lo:1.2,hi:1.6}];
const HOURS=[{h:2,add:0},{h:8,add:0.2},{h:16,add:0.4},{h:24,add:0.7}];
const ZVALS=[5,10,20,30,40,60,80,100];
const TEMPS=[
  {l:'do 30 °C',m:1,note:''},
  {l:'30–40 °C',m:1.2,note:'katalog: fs × 1,1–1,2'},
  {l:'40–50 °C',m:1.4,note:'katalog: fs × 1,3–1,4'},
  {l:'50–60 °C',m:1.6,note:'katalog: fs × 1,5–1,6'},
  {l:'> 60 °C',m:null,note:'katalog nie podaje mnożnika — wymagane fs ustala serwis techniczny DKM'}];
const r1=n=>Math.round(n*10)/10;
const FSMINS=[null,'below',1.0,1.3,1.6,2.0];
const fsPass=(fs,sel)=>sel==null?true:(sel==='below'?fs<1.0:fs>=sel);
const num=n=>String(n).replace('.',',');
const fs1=n=>n.toFixed(1).replace('.',',');
const zl=n=>String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g,'\u202f')+' z\u0142';
const zl2=n=>n.toFixed(2).replace('.',',').replace(/\B(?=(\d{3})+(?!\d)\d{0,2},)/g,'\u202f')+' z\u0142';
const V=k=>'var(--color-'+k+')';
const plural=(n,a,b,c)=>{const d=n%10,s=n%100;return n===1?a:(d>=2&&d<=4&&!(s>=12&&s<=14)?b:c);};


export { CAT, TERMS, LOADS, HOURS, ZVALS, TEMPS, r1, FSMINS, fsPass, num, fs1, zl, zl2, V, plural };
