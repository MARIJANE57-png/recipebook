// Recipe Management - Import Page

let ingredientCount = 1;
let instructionCount = 1;

// Add ingredient input field
function addIngredient() {
    ingredientCount++;
    const ingredientList = document.getElementById('ingredientList');
    const newIngredient = document.createElement('div');
    newIngredient.className = 'ingredient-item';
    newIngredient.innerHTML = `
        <input type="text" class="ingredient-input" placeholder="Add ingredient">
        <button type="button" class="btn-remove" onclick="removeIngredient(this)">×</button>
    `;
    ingredientList.appendChild(newIngredient);
}

// Remove ingredient input field
function removeIngredient(button) {
    const ingredientList = document.getElementById('ingredientList');
    if (ingredientList.children.length > 1) {
        button.parentElement.remove();
        ingredientCount--;
    }
}

// Add instruction input field
function addInstruction() {
    instructionCount++;
    const instructionList = document.getElementById('instructionList');
    const newInstruction = document.createElement('div');
    newInstruction.className = 'instruction-item';
    newInstruction.innerHTML = `
        <span class="instruction-number">${instructionCount}</span>
        <textarea class="instruction-input" rows="2" placeholder="Add instruction step"></textarea>
        <button type="button" class="btn-remove" onclick="removeInstruction(this)">×</button>
    `;
    instructionList.appendChild(newInstruction);
}

// Remove instruction input field
function removeInstruction(button) {
    const instructionList = document.getElementById('instructionList');
    if (instructionList.children.length > 1) {
        button.parentElement.remove();
        updateInstructionNumbers();
        instructionCount--;
    }
}

// Update instruction numbers after removal
function updateInstructionNumbers() {
    const instructions = document.querySelectorAll('.instruction-number');
    instructions.forEach((num, index) => {
        num.textContent = index + 1;
    });
}

// Get recipes from localStorage
function getRecipes() {
    try {
        const recipes = localStorage.getItem('recipes');
        return recipes ? JSON.parse(recipes) : [];
    } catch (error) {
        console.error('Error loading recipes:', error);
        return [];
    }
}

// Safe storage function to prevent Chrome crashes
function safelyStoreRecipe(recipe) {
    // Remove any image data
    delete recipe.thumbnailUrl;
    delete recipe.image;

    // Get current recipes
    let recipes = getRecipes();
    recipes.push(recipe);

    // Check size before saving (4MB limit)
    const dataString = JSON.stringify(recipes);
    if (dataString.length > 4000000) {
        alert('Storage full! Delete some recipes first.');
        return false;
    }

    try {
        localStorage.setItem('recipes', dataString);
        return true;
    } catch (error) {
        console.error('Error saving recipes:', error);
        alert('Failed to save recipe. Storage may be full.');
        return false;
    }
}

// Save recipes to localStorage
function saveRecipes(recipes) {
    // Check size before saving (4MB limit)
    const dataString = JSON.stringify(recipes);
    if (dataString.length > 4000000) {
        alert('Storage full! Delete some recipes first.');
        return false;
    }

    try {
        localStorage.setItem('recipes', dataString);
        return true;
    } catch (error) {
        console.error('Error saving recipes:', error);
        alert('Failed to save recipe. Storage may be full.');
        return false;
    }
}

// Handle form submission
document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('recipeForm');

    if (form) {
        form.addEventListener('submit', function(e) {
            e.preventDefault();

            // Get form values
            const title = document.getElementById('recipeTitle').value.trim();
            const description = document.getElementById('recipeDescription').value.trim();
            const prepTime = document.getElementById('prepTime').value;
            const cookTime = document.getElementById('cookTime').value;
            const servings = document.getElementById('servings').value;

            // Get ingredients
            const ingredientInputs = document.querySelectorAll('.ingredient-input');
            const ingredients = Array.from(ingredientInputs)
                .map(input => input.value.trim())
                .filter(value => value !== '');

            // Get instructions
            const instructionInputs = document.querySelectorAll('.instruction-input');
            const instructions = Array.from(instructionInputs)
                .map(input => input.value.trim())
                .filter(value => value !== '');

            // Validate
            if (!title) {
                alert('Please enter a recipe title');
                return;
            }

            if (ingredients.length === 0) {
                alert('Please add at least one ingredient');
                return;
            }

            if (instructions.length === 0) {
                alert('Please add at least one instruction step');
                return;
            }

            // Create recipe object
            const recipe = {
                id: Date.now().toString(),
                title,
                description,
                prepTime: parseInt(prepTime) || 0,
                cookTime: parseInt(cookTime) || 0,
                servings: parseInt(servings) || 1,
                ingredients,
                instructions,
                createdAt: new Date().toISOString()
            };

            // Save to localStorage with size check
            if (safelyStoreRecipe(recipe)) {
                alert('Recipe saved successfully!');
                form.reset();

                // Reset dynamic fields
                const ingredientList = document.getElementById('ingredientList');
                ingredientList.innerHTML = `
                    <div class="ingredient-item">
                        <input type="text" class="ingredient-input" placeholder="Add ingredient">
                        <button type="button" class="btn-remove" onclick="removeIngredient(this)">×</button>
                    </div>
                `;

                const instructionList = document.getElementById('instructionList');
                instructionList.innerHTML = `
                    <div class="instruction-item">
                        <span class="instruction-number">1</span>
                        <textarea class="instruction-input" rows="2" placeholder="Add instruction step"></textarea>
                        <button type="button" class="btn-remove" onclick="removeInstruction(this)">×</button>
                    </div>
                `;

                ingredientCount = 1;
                instructionCount = 1;
            }
        });
    }
});
