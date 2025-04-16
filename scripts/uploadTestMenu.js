const admin = require('firebase-admin');
const path = require('path');

// Initialize Firebase Admin
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

const testMenu = {
  date: "2025-04-15",
  breakfast: [
    {
      name: "USC Village Dining Hall",
      sections: [
        {
          name: "Flexitarian",
          items: [
            {
              name: "Scrambled Eggs",
              allergens: ["Eggs", "Halal Ingredients", "Vegetarian"]
            },
            {
              name: "Tofu",
              allergens: ["Soy", "Vegan"]
            }
          ]
        }
      ]
    }
  ],
  lunch: [
    {
      name: "Parkside Restaurant & Grill",
      sections: [
        {
          name: "Pizza/Salad Bar",
          items: [
            {
              name: "Cheese Pita Pizza",
              allergens: ["Dairy", "Halal Ingredients", "Soy", "Vegetarian", "Wheat / Gluten"]
            },
            {
              name: "Pepperoni Pita Pizza",
              allergens: ["Dairy", "Pork", "Soy", "Wheat / Gluten"]
            }
          ]
        }
      ]
    }
  ],
  dinner: [
    {
      name: "Everybody's Kitchen",
      sections: [
        {
          name: "Hot Line",
          items: [
            {
              name: "Pasta Carbonara with Bacon and Eggs",
              allergens: ["Dairy", "Eggs", "Pork", "Wheat / Gluten"]
            },
            {
              name: "Roasted Cauliflower with Dill, Garlic and Lemon",
              allergens: ["Halal Ingredients", "Vegan"]
            }
          ]
        }
      ]
    }
  ]
};

async function uploadTestMenu() {
  try {
    await db.collection('menus').doc('2025-04-15').set(testMenu);
    console.log('Successfully uploaded test menu data!');
  } catch (error) {
    console.error('Error uploading test menu:', error);
  } finally {
    // Clean up Firebase Admin
    await admin.app().delete();
  }
}

uploadTestMenu(); 