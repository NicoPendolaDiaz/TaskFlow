/**
 * TaskFlow - API integration
 * Author: Nico Péndola Díaz
 */

export const fetchDailySugerence = async () => {
  try {
    // Usamos una API pública de citas motivacionales para la "Sugerencia del Día"
    const response = await fetch('https://api.quotable.io/random?tags=technology,motivational');
    if (!response.ok) throw new Error('Network response was not ok');
    
    const data = await response.json();
    return {
      content: data.content,
      author: data.author
    };
  } catch (error) {
    console.error('Error fetching suggestion:', error);
    return {
      content: "La disciplina supera al talento cuando el talento no se esfuerza.",
      author: "Proverbio"
    };
  }
};
