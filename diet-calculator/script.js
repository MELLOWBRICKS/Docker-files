document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('dietForm');
    const resultsSection = document.getElementById('results');

    form.addEventListener('submit', function(e) {
        e.preventDefault();
        calculateDietPlan();
    });

    function calculateDietPlan() {
        // Get form values
        const age = parseInt(document.getElementById('age').value);
        const gender = document.getElementById('gender').value;
        const currentWeight = parseFloat(document.getElementById('currentWeight').value);
        const currentHeight = parseFloat(document.getElementById('currentHeight').value);
        const goalWeight = parseFloat(document.getElementById('goalWeight').value);
        const activityLevel = parseFloat(document.getElementById('activityLevel').value);
        const goal = document.getElementById('goal').value;

        // Calculate BMI
        const currentBMI = calculateBMI(currentWeight, currentHeight);
        const goalBMI = calculateBMI(goalWeight, currentHeight);

        // Calculate BMR (Basal Metabolic Rate) using Mifflin-St Jeor Equation
        let bmr;
        if (gender === 'male') {
            bmr = (10 * currentWeight) + (6.25 * currentHeight) - (5 * age) + 5;
        } else {
            bmr = (10 * currentWeight) + (6.25 * currentHeight) - (5 * age) - 161;
        }

        // Calculate TDEE (Total Daily Energy Expenditure)
        const tdee = bmr * activityLevel;

        // Calculate target calories based on goal
        let targetCalories;
        let weightChangePerWeek;
        
        switch(goal) {
            case 'lose':
                targetCalories = tdee - 500; // 500 calorie deficit for ~1 lb/week loss
                weightChangePerWeek = -0.5; // kg per week
                break;
            case 'gain':
                targetCalories = tdee + 500; // 500 calorie surplus for ~1 lb/week gain
                weightChangePerWeek = 0.5; // kg per week
                break;
            default: // maintain
                targetCalories = tdee;
                weightChangePerWeek = 0;
        }

        // Calculate macronutrients
        const macros = calculateMacros(targetCalories, goal);

        // Display results
        displayResults(currentBMI, goalBMI, targetCalories, weightChangePerWeek, macros, goal, currentWeight, goalWeight);
        
        // Show results section
        resultsSection.style.display = 'block';
        resultsSection.scrollIntoView({ behavior: 'smooth' });
    }

    function calculateBMI(weight, height) {
        const heightInMeters = height / 100;
        return (weight / (heightInMeters * heightInMeters)).toFixed(1);
    }

    function calculateMacros(calories, goal) {
        let proteinPercent, carbPercent, fatPercent;

        switch(goal) {
            case 'lose':
                proteinPercent = 0.35; // Higher protein for muscle preservation
                carbPercent = 0.35;
                fatPercent = 0.30;
                break;
            case 'gain':
                proteinPercent = 0.25;
                carbPercent = 0.45; // Higher carbs for muscle building
                fatPercent = 0.30;
                break;
            default: // maintain
                proteinPercent = 0.30;
                carbPercent = 0.40;
                fatPercent = 0.30;
        }

        const proteinCalories = calories * proteinPercent;
        const carbCalories = calories * carbPercent;
        const fatCalories = calories * fatPercent;

        return {
            protein: {
                grams: Math.round(proteinCalories / 4),
                calories: Math.round(proteinCalories)
            },
            carbs: {
                grams: Math.round(carbCalories / 4),
                calories: Math.round(carbCalories)
            },
            fats: {
                grams: Math.round(fatCalories / 9),
                calories: Math.round(fatCalories)
            }
        };
    }

    function displayResults(currentBMI, goalBMI, calories, weightChange, macros, goal, currentWeight, goalWeight) {
        // Display basic stats
        document.getElementById('currentBMI').textContent = currentBMI;
        document.getElementById('goalBMI').textContent = goalBMI;
        document.getElementById('dailyCalories').textContent = Math.round(calories) + ' kcal';
        
        const weightDiff = goalWeight - currentWeight;
        const changeText = weightDiff > 0 ? `+${weightDiff.toFixed(1)} kg` : `${weightDiff.toFixed(1)} kg`;
        document.getElementById('weightChange').textContent = changeText;

        // Display macros
        document.getElementById('protein').textContent = macros.protein.grams + 'g';
        document.getElementById('proteinCalories').textContent = `(${macros.protein.calories} kcal)`;
        
        document.getElementById('carbs').textContent = macros.carbs.grams + 'g';
        document.getElementById('carbsCalories').textContent = `(${macros.carbs.calories} kcal)`;
        
        document.getElementById('fats').textContent = macros.fats.grams + 'g';
        document.getElementById('fatsCalories').textContent = `(${macros.fats.calories} kcal)`;

        // Generate meal plan
        generateMealPlan(calories, macros, goal);
        
        // Generate food list
        generateFoodList(macros, goal);
    }

    function generateMealPlan(calories, macros, goal) {
        const mealPlanContainer = document.getElementById('mealPlan');
        
        const meals = {
            'Breakfast': {
                calories: Math.round(calories * 0.25),
                protein: Math.round(macros.protein.grams * 0.25),
                carbs: Math.round(macros.carbs.grams * 0.30),
                fats: Math.round(macros.fats.grams * 0.25)
            },
            'Lunch': {
                calories: Math.round(calories * 0.35),
                protein: Math.round(macros.protein.grams * 0.35),
                carbs: Math.round(macros.carbs.grams * 0.35),
                fats: Math.round(macros.fats.grams * 0.35)
            },
            'Dinner': {
                calories: Math.round(calories * 0.30),
                protein: Math.round(macros.protein.grams * 0.30),
                carbs: Math.round(macros.carbs.grams * 0.25),
                fats: Math.round(macros.fats.grams * 0.30)
            },
            'Snacks': {
                calories: Math.round(calories * 0.10),
                protein: Math.round(macros.protein.grams * 0.10),
                carbs: Math.round(macros.carbs.grams * 0.10),
                fats: Math.round(macros.fats.grams * 0.10)
            }
        };

        const mealSuggestions = {
            'Breakfast': [
                'Oatmeal with berries and nuts',
                'Greek yogurt with granola',
                'Scrambled eggs with whole grain toast',
                'Protein smoothie with banana'
            ],
            'Lunch': [
                'Grilled chicken salad with quinoa',
                'Salmon with sweet potato and vegetables',
                'Turkey and avocado wrap',
                'Lentil soup with whole grain bread'
            ],
            'Dinner': [
                'Lean beef with brown rice and broccoli',
                'Baked fish with roasted vegetables',
                'Chicken stir-fry with mixed vegetables',
                'Tofu curry with cauliflower rice'
            ],
            'Snacks': [
                'Apple with almond butter',
                'Greek yogurt with berries',
                'Mixed nuts and seeds',
                'Protein bar'
            ]
        };

        let mealPlanHTML = '';
        
        Object.keys(meals).forEach(mealName => {
            const meal = meals[mealName];
            const suggestions = mealSuggestions[mealName];
            const randomSuggestion = suggestions[Math.floor(Math.random() * suggestions.length)];
            
            mealPlanHTML += `
                <div class="meal-card">
                    <h4>${mealName}</h4>
                    <div class="meal-item"><strong>Target:</strong> ${meal.calories} kcal</div>
                    <div class="meal-item"><strong>Protein:</strong> ${meal.protein}g</div>
                    <div class="meal-item"><strong>Carbs:</strong> ${meal.carbs}g</div>
                    <div class="meal-item"><strong>Fats:</strong> ${meal.fats}g</div>
                    <div class="meal-item"><strong>Suggestion:</strong> ${randomSuggestion}</div>
                </div>
            `;
        });
        
        mealPlanContainer.innerHTML = mealPlanHTML;
    }

    function generateFoodList(macros, goal) {
        const foodListContainer = document.getElementById('foodList');
        
        const foodCategories = {
            'Protein Sources': [
                { name: 'Chicken Breast (cooked)', amount: '100g = 31g protein, 165 kcal' },
                { name: 'Salmon (cooked)', amount: '100g = 25g protein, 208 kcal' },
                { name: 'Greek Yogurt (plain)', amount: '100g = 10g protein, 59 kcal' },
                { name: 'Eggs (large)', amount: '1 egg = 6g protein, 70 kcal' },
                { name: 'Tofu (firm)', amount: '100g = 15g protein, 144 kcal' },
                { name: 'Lentils (cooked)', amount: '100g = 9g protein, 116 kcal' },
                { name: 'Lean Beef (cooked)', amount: '100g = 26g protein, 250 kcal' }
            ],
            'Carbohydrate Sources': [
                { name: 'Brown Rice (cooked)', amount: '100g = 23g carbs, 111 kcal' },
                { name: 'Quinoa (cooked)', amount: '100g = 22g carbs, 120 kcal' },
                { name: 'Sweet Potato (baked)', amount: '100g = 20g carbs, 86 kcal' },
                { name: 'Oats (dry)', amount: '50g = 32g carbs, 190 kcal' },
                { name: 'Whole Wheat Bread', amount: '1 slice = 12g carbs, 69 kcal' },
                { name: 'Banana (medium)', amount: '1 banana = 27g carbs, 105 kcal' },
                { name: 'Apple (medium)', amount: '1 apple = 25g carbs, 95 kcal' }
            ],
            'Healthy Fats': [
                { name: 'Avocado', amount: '100g = 15g fat, 160 kcal' },
                { name: 'Almonds', amount: '30g = 15g fat, 174 kcal' },
                { name: 'Olive Oil', amount: '1 tbsp = 14g fat, 119 kcal' },
                { name: 'Walnuts', amount: '30g = 20g fat, 196 kcal' },
                { name: 'Chia Seeds', amount: '1 tbsp = 3g fat, 58 kcal' },
                { name: 'Peanut Butter', amount: '2 tbsp = 16g fat, 188 kcal' },
                { name: 'Coconut Oil', amount: '1 tbsp = 14g fat, 117 kcal' }
            ],
            'Vegetables (Low Calorie)': [
                { name: 'Broccoli (cooked)', amount: '100g = 5g carbs, 34 kcal' },
                { name: 'Spinach (raw)', amount: '100g = 4g carbs, 23 kcal' },
                { name: 'Bell Peppers', amount: '100g = 6g carbs, 31 kcal' },
                { name: 'Cucumber', amount: '100g = 4g carbs, 16 kcal' },
                { name: 'Tomatoes', amount: '100g = 4g carbs, 18 kcal' },
                { name: 'Cauliflower', amount: '100g = 5g carbs, 25 kcal' },
                { name: 'Zucchini', amount: '100g = 3g carbs, 17 kcal' }
            ]
        };

        let foodListHTML = '';
        
        Object.keys(foodCategories).forEach(categoryName => {
            const foods = foodCategories[categoryName];
            
            foodListHTML += `
                <div class="food-category">
                    <h4>${categoryName}</h4>
            `;
            
            foods.forEach(food => {
                foodListHTML += `
                    <div class="food-item">
                        <span class="food-name">${food.name}</span>
                        <span class="food-amount">${food.amount}</span>
                    </div>
                `;
            });
            
            foodListHTML += '</div>';
        });
        
        foodListContainer.innerHTML = foodListHTML;
    }
});
