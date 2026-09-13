export function formatReason(reason) {
  if (!reason) return 'Movimiento de puntos'
  return reason
    .replace(/verso_flash/gi, 'Verso Flash')
    .replace(/que_harias/gi, '¿Qué Harías?')
    .replace(/reto_60/gi, 'Reto 60')
    .replace(/verdadero_falso/gi, 'Verdadero o Falso')
    .replace(/ahorcado/gi, 'Ahorcado Bíblico')
    .replace(/ordena_verso/gi, 'Ordena el Versículo')
}
