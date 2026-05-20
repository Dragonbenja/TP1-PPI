/* ══════════════════════════════════════════════════════════════
   calculadora.js — Lógica de la calculadora
   ══════════════════════════════════════════════════════════════

   DESCRIPCIÓN (RESUMEN):
   El usuario pulsa botones en este orden:
     1. Escribe el primer número  → enterNumber()
     2. Elige un operador         → enterOperator()
     3. Escribe el segundo número → enterNumber()
     4. Pulsa "="                 → calculateResult()

   Las cuatro variables de estado siguientes guardan el estado actual
   de la calculadora.
   ══════════════════════════════════════════════════════════════ */


// ════════════════════════════════════════════════════════════════
// 1. VARIABLES DE ESTADO
//    Estas 4 variables son la "memoria" de la calculadora.
//    Cada vez que el usuario pulsa un botón, alguna de ellas cambia.
// ════════════════════════════════════════════════════════════════

let currentNumber   = '';    // Número que el usuario escribe ahora.
                            // Ejemplo: teclas 3,5,7 → currentNumber = "357"

let previousNumber = '';    // Primer número guardado cuando se elige un operador.
                            // Ejemplo: en "8 + 3", aquí se guarda "8"

let operator       = null;  // Operador elegido: '+', '-', '*' o '/'.
                            // Es null si no se escogió ninguno todavía.

let waitingSecond = false; // Se vuelve true justo después de pulsar un operador.
                          // Indica que las próximas teclas pertenecen al SEGUNDO número.


// ════════════════════════════════════════════════════════════════
// 2. REFERENCIAS A LA PANTALLA
//    Guardar referencias a los elementos de la pantalla para poder
//    actualizarlos desde JavaScript.
// ════════════════════════════════════════════════════════════════

// Línea grande: muestra el número actual (ej: "357")
const displayResult = document.getElementById('resultado');

// Línea pequeña: muestra la operación completa (ej: "8 + 3 =")
const displayExpression = document.getElementById('expresion');


// ════════════════════════════════════════════════════════════════
// 3. FUNCIONES PRINCIPALES
// ════════════════════════════════════════════════════════════════

/*
 * enterNumber(digit)
 * -------------------
 * Se llama cuando el usuario pulsa un dígito (0-9).
 * Recibe el dígito como texto: "0", "1" ... "9"
 */
function enterNumber(digit) {

  if (waitingSecond) {
    // Justo después de pulsar un operador, el siguiente número comienza desde cero.
    currentNumber     = digit;
    waitingSecond = false;

  } else {
    // Caso especial: no permitir "00", "000", etc.
    if (currentNumber === '0' && digit === '0') return;

    // Si la pantalla muestra "0" y se pulsa otro dígito,
    // reemplazar el cero en vez de añadir al lado.
    if (currentNumber === '0') {
      currentNumber = digit;
    } else {
      currentNumber += digit; // concatenar el dígito
    }
  }

  show(currentNumber); // actualizar la pantalla principal
}


/*
 * enterDecimal()
 * ---------------
 * Se llama cuando el usuario pulsa el botón ".".
 * Solo añade el punto si el número actual no lo tiene ya.
 */
function enterDecimal() {

  // Si acabamos de pulsar un operador, empezamos con "0."
  if (waitingSecond) {
    currentNumber     = '0.';
    waitingSecond = false;
    show(currentNumber);
    return;
  }

  // Si la pantalla está vacía, ponemos "0." directamente
  if (currentNumber === '') {
    currentNumber = '0.';
    show(currentNumber);
    return;
  }

  // Solo añadimos el punto si el número todavía no tiene ninguno
  if (!currentNumber.includes('.')) {
    currentNumber += '.';
    show(currentNumber);
  }
}


/*
 * enterOperator(op)
 * ------------------
 * Se llama cuando el usuario pulsa +, -, *, / o %.
 * Guarda el primer número y el operador elegido, y activa la
 * bandera waitingSecond para preparar el siguiente número.
 */
function enterOperator(op) {

  // Si no hay nada escrito todavía, no hacer nada
  if (currentNumber === '' && previousNumber === '') return;

  // Si ya había una operación pendiente (ej: 5 + 3 y ahora ×),
  // calcular primero el resultado anterior antes de guardar el nuevo operador.
  if (currentNumber !== '' && previousNumber !== '' && !waitingSecond) {
    calculateResult(true); // true = calcular en silencio (sin "=")
  }

  // Guardar operador y primer número
  operator         = op;
  previousNumber   = currentNumber !== '' ? currentNumber : displayResult.textContent;
  waitingSecond = true;

  // Mostrar en la línea pequeña, por ejemplo: "8 +"
  const symbols = { '+':'+', '-':'−', '*':'×', '/':'÷', '%':'%' };
  displayExpression.textContent = previousNumber + ' ' + symbols[op];
}


/*
 * calculateResult(silent)
 * -------------------------
 * Se llama cuando el usuario pulsa "=".
 * Toma los dos números guardados y el operador, realiza la operación
 * y muestra el resultado.
 *
 * silent = true → usado internamente al encadenar operaciones,
 *                no actualiza la línea pequeña aún.
 */
function calculateResult(silent = false) {

  // Si falta el operador o el segundo número, no hay nada que calcular
  if (operator === null || waitingSecond) return;

  // Convertir textos a números para operar
  const a = parseFloat(previousNumber);
  const b = parseFloat(currentNumber);

  // Realizar la operación según el operador guardado
  let result;
  switch (operator) {
    case '+': result = a + b;  break;
    case '-': result = a - b;  break;
    case '*': result = a * b;  break;
    case '/':
      if (b === 0) {              // no se puede dividir por cero
        show('Error');
        resetState();
        return;
      }
      result = a / b;
      break;
    case '%': result = a % b;  break;
    default: return;
  }

  // Corregir imprecisiones de punto flotante (ej: 0.1 + 0.2)
  result = parseFloat(result.toPrecision(12));

  // Si no es silent, actualizar la línea pequeña con la expresión completa
  if (!silent) {
    const symbols = { '+':'+', '-':'−', '*':'×', '/':'÷', '%':'%' };
    displayExpression.textContent = previousNumber + ' ' + symbols[operator] + ' ' + currentNumber + ' =';
  }

  // Mostrar resultado y resetear estado para la próxima operación
  show(result);
  currentNumber     = String(result); // el resultado puede ser punto de partida
  previousNumber   = '';
  operator         = null;
  waitingSecond = false;
}


/*
 * deleteLast()
 * -------------
 * Se llama al pulsar Backspace. Elimina el último dígito.
 */
function deleteLast() {
  if (waitingSecond) return; // no borrar si se está esperando el segundo número

  currentNumber = currentNumber.slice(0, -1); // quitar último carácter

  // Si ya no queda nada, mostrar "0" en lugar de vacío
  show(currentNumber === '' ? '0' : currentNumber);
}


/*
 * clearAll()
 * ----------
 * Se llama al pulsar AC. Borra todo y vuelve al estado inicial.
 */
function clearAll() {
  resetState();
  show('0');
  displayExpression.textContent = '';
}


// ════════════════════════════════════════════════════════════════
// 4. FUNCIONES DE APOYO
// ════════════════════════════════════════════════════════════════

/*
 * show(value)
 * -------------
 * Escribe un valor en la pantalla grande.
 * Centralizar esta operación evita repetir la misma línea en todo el código.
 */
function show(value) {
  displayResult.textContent = value;
}


/*
 * resetState()
 * ------------
 * Devuelve las variables de estado a sus valores iniciales.
 * Se usa en clearAll() y cuando ocurre un error.
 */
function resetState() {
  currentNumber     = '';
  previousNumber   = '';
  operator         = null;
  waitingSecond = false;
}


// ════════════════════════════════════════════════════════════════
// 5. SOPORTE DE TECLADO
//    Permite usar la calculadora con el teclado físico.
// ════════════════════════════════════════════════════════════════

document.addEventListener('keydown', function(event) {
  const key = event.key; // tecla presionada

  if (key >= '0' && key <= '9') {
    enterNumber(key);          // teclas 0-9

  } else if (key === '.') {
    enterDecimal();            // tecla del punto

  } else if (['+', '-', '*', '/', '%'].includes(key)) {
    enterOperator(key);        // teclas de operadores

  } else if (key === 'Enter' || key === '=') {
    calculateResult();         // Enter o = → calcular

  } else if (key === 'Backspace') {
    deleteLast();              // Backspace → borrar último dígito

  } else if (key === 'Escape') {
    clearAll();                // Escape → limpiar todo (AC)
  }
});


// ════════════════════════════════════════════════════════════════
// 6. MANEJADORES DE CLICK EN BOTONES
//    Asociar listeners a los botones para evitar JS inline en el HTML.
// ════════════════════════════════════════════════════════════════

const buttons = document.querySelectorAll('.grid .btn');

buttons.forEach(button => {
  button.addEventListener('click', () => {
    if (button.hasAttribute('data-value')) {
      // botón numérico (incluye "0")
      enterNumber(button.dataset.value);

    } else if (button.hasAttribute('data-operator')) {
      // botón operador: '+', '-', '*', '/', '%'
      enterOperator(button.dataset.operator);

    } else {
      const action = button.dataset.action;
      if (action === 'decimal') {
        enterDecimal();
      } else if (action === 'ac') {
        clearAll();
      } else if (action === 'delete') {
        deleteLast();
      } else if (action === 'equals') {
        calculateResult();
      }
    }
  });
});
