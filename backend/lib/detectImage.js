// detectImage.js
export async function detectImage(imageData, apiUrl = 'http://localhost:10000/predict') {
  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ image: imageData })
    });

    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.error || 'Server error');
    }

    const result = await response.json();
    return result;

  } catch (error) {
    console.error('Error calling detect API:', error);
    throw error;
  }
}
