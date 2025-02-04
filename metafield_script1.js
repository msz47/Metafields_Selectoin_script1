if(isProductPageByURL){
    
    const productForm = document.querySelector('form[action="/cart/add"]');
    if(!productForm) {
        console.log('No Form Found');
    }

    const shopName = Shopify.shop;
    const variantSelect = productForm.querySelector('select[name="id"]');
    const variantInput = productForm.querySelector('input[name="id"]');

    const productSelect = productForm.querySelector('select[name="product-id"]');
    const productInput = productForm.querySelector('input[name="product-id"]');
    let variantId = null;
    let productId = null;
    let cartId = null;
    let cartToken= getCart();
    if (variantSelect) {
        variantId = variantSelect.value;
        
    } else if (variantInput) {
        variantId = variantInput.value;
        
    } else {
        console.log('Variant ID not found in the product form.');
    }

    if (productSelect) {
        productId = productSelect.value;
        console.log(productId);
    } else if (productInput) {
        productId = productInput.value;
        console.log(productId);
        
    } else {
        console.log('Product ID not found in the product form.');
    }

    if (typeof jQuery == 'undefined') 
    {
        var script = document.createElement("script");
        script.src = "https://ajax.googleapis.com/ajax/libs/jquery/3.6.0/jquery.min.js";
        script.type = "text/javascript";
        script.onload = function () {
            console.log("jQuery loaded successfully.");
            runAfterjQueryLoads(); // Run your AJAX calls here
        };
        document.head.appendChild(script);
    } else {
        runAfterjQueryLoads(); // Run immediately if jQuery is already loaded
    }
    
    function runAfterjQueryLoads() {
        console.log("Running AJAX after jQuery is loaded.");
         if(cartToken){
            cartId = "gid://shopify/Cart/" + cartToken;
            getMetafields(shopName, productId); // Call GetMetafields immediately
        }else{
            $.ajax ({
                url: `https://9229-124-109-62-57.ngrok-free.app/GiftShip/CreateCart?shopName=${shopName}`,
                type: "POST",
                contentType: "application/json;charset=utf-8",
                dataType: "json",
                success: function (data) {
                    console.log(data)
                    if(data.cartToken != null){
                        setCartCookie(data.cartToken, shopName);
                        cartId = "gid://shopify/Cart/" + data;
                        location.reload();
                    }
                },
                error: function (data, errorType, error) {
                    console.error('Error:', error);
                    $("#loadingShippingProducts .loading-overlay").addClass('d-none');
                },
                complete: function () {
                    
                }
            });
        }
        if (sessionStorage.getItem("reloadAfterCart")) {
            sessionStorage.removeItem("reloadAfterCart"); // Remove flag
            getMetafields(shopName, productId);
        }
    }
    
   
    
}

function isProductPageByURL() {
    return window.location.pathname.includes("/products/");
}
function appendOptionsAsButtons(optionsData) {

        // Find an element whose ID contains "template--"
    const templateElement = document.querySelector("[id*='template--']");
    let numericId = null;

    if (templateElement) {
        const match = templateElement.id.match(/template--(\d+)/);
        if (match) {
            numericId = match[1];
        }
    }

    // Try to find the existing Add to Cart button
    let addToCartButton = numericId
        ? document.querySelector(`[id*='ProductSubmitButton-template--${numericId}']`)
        : document.querySelector("button[name='add'].product-form__cart-submit");

    // If an Add to Cart button is found, clone it (without event listeners)
    let customAddToCartButton;
    if (addToCartButton) {
        customAddToCartButton = addToCartButton.cloneNode(true);
        customAddToCartButton.id = "custom_cart_btn";
        customAddToCartButton.name = "add_to_cart";
        customAddToCartButton.type = "button"; // Change type to button to prevent default form submission
        customAddToCartButton.removeAttribute("fdprocessedid"); // Remove Shopify-processed ID
    } else {
        // If no Add to Cart button is found, create one from scratch
        customAddToCartButton = document.createElement("button");
        customAddToCartButton.id = "custom_cart_btn";
        customAddToCartButton.type = "button";
        customAddToCartButton.name = "add_to_cart";
        customAddToCartButton.setAttribute("aria-label", "Add to cart");
        customAddToCartButton.setAttribute("aria-haspopup", "dialog");
        customAddToCartButton.className = "product-form__submit button button--full-width button--secondary";
        customAddToCartButton.dataset.addToCart = "";

        // Set button inner content with both loader and button text
        customAddToCartButton.innerHTML = `
            <span>Add to cart</span>
            <div class="loading__spinner hidden">
                <svg aria-hidden="true" focusable="false" class="spinner" viewBox="0 0 66 66" xmlns="http://www.w3.org/2000/svg">
                    <circle class="path" fill="none" stroke-width="6" cx="33" cy="33" r="30"></circle>
                </svg>
            </div>
        `;
    }

    // Handle button click - Show loader, disable button
    customAddToCartButton.addEventListener("click", function (e) {
        e.preventDefault();

        // Ensure these elements exist now that they are correctly set in the button's innerHTML
        const loader = customAddToCartButton.querySelector(".loading__spinner");
        const buttonText = customAddToCartButton.querySelector("span");

        if (loader && buttonText) {
            loader.classList.remove("hidden");
            buttonText.textContent = "Adding...";
        }

        customAddToCartButton.disabled = true;

        // Simulate async action (replace with actual API call)
        setTimeout(() => {
            if (loader && buttonText) {
                loader.classList.add("hidden");
                buttonText.textContent = "Add to cart";
            }
            customAddToCartButton.disabled = false;
        }, 1000);
    });

    // Find the Checkout button container
    const checkoutButtonContainer = document.querySelector("div[data-shopify='payment-button']");
    if (!checkoutButtonContainer) return;

    // Insert the custom button before the checkout button
    checkoutButtonContainer.parentNode.insertBefore(customAddToCartButton, checkoutButtonContainer);

    // Hide the original Add to Cart button if found
    if (addToCartButton) {
        addToCartButton.style.display = "none";
    }

    const selectedOptions = {};
    const targetElement = document.getElementById(`variant-selects-template--${numericId}__main`);
    let element = document.querySelector('.color-scheme-4');
    let colotrOptionChecked = getComputedStyle(document.querySelector('.product-form__input product-form__input--pill') || document.documentElement).getPropertyValue('--color-foreground').trim() || '#000000';
    let colorOptionUnChecked = getComputedStyle(document.querySelector('.product-form__input product-form__input--pill') || document.documentElement).getPropertyValue('--color-background').trim() || '#000000';
    let optionRadius = getComputedStyle(document.querySelector('.product-form__input product-form__input--pill') || document.documentElement).getPropertyValue('--variant-pills-radius').trim() || '#000000';
    let optionBorderWidth = getComputedStyle(document.querySelector('.product-form__input product-form__input--pill') || document.documentElement).getPropertyValue('--variant-pills-border-width').trim() || '1px';
    let optionBorderOpacity = getComputedStyle(document.querySelector('.product-form__input product-form__input--pill') || document.documentElement).getPropertyValue('--variant-pills-border-opacity').trim() || '1';
    let font = getComputedStyle(document.querySelector('.product-form__input product-form__input--pill') || document.documentElement).getPropertyValue('--font-body-family').trim() || "";
    let borderColor = `${colotrOptionChecked}`;
    let hoverborder = `rgb(${colotrOptionChecked}, 1)`;
     if(colotrOptionChecked.includes(',')){
        borderColor = `rgb(${colotrOptionChecked}, ${optionBorderOpacity})`;
        colotrOptionChecked = `rgb(${colotrOptionChecked})`;
        
    }
    if(colorOptionUnChecked.includes(',')){
        colorOptionUnChecked = `rgb(${colorOptionUnChecked})`;
    }
    

    if (!targetElement) return;

    Object.keys(optionsData).forEach((category, categoryIndex) => {
        const optionContainer = document.createElement("div");
        optionContainer.style.margin = "20px 0";
    
        // Category title
        const categoryTitle = document.createElement("legend");
        categoryTitle.className = "form__label";
    
        optionContainer.prepend(categoryTitle);
        categoryTitle.textContent = category;
        optionContainer.appendChild(categoryTitle);
    
        // Button group container
        const buttonGroup = document.createElement("div");
        buttonGroup.style.display = "flex";
        buttonGroup.style.flexWrap = "wrap";
        buttonGroup.style.gap = "10px";
    
        optionsData[category].forEach((option, index) => {
            const button = document.createElement("button");
            button.type = "button";
            button.textContent = option;
            button.dataset.value = option; // Store the value in dataset
            button.dataset.category = category;
            button.classList.add('custom_optin_btn'); // Store category name
    
            // Apply base styles
            Object.assign(button.style, {
                padding: "10px 20px",
                font: font,
                border: `${optionBorderWidth} solid ${borderColor}`,
                backgroundColor: colorOptionUnChecked,
                color: colotrOptionChecked,
                cursor: "pointer",
                borderRadius: optionRadius,
                fontSize: "14px",
                transition: "all 0.3s ease"
            });
    
            const custom_option_style = document.createElement("style");
            custom_option_style.textContent = `
                .custom_optin_btn:hover {
                    border: ${optionBorderWidth} solid ${hoverborder} !important;
                    cursor: pointer;
                }
            `;
            document.head.appendChild(custom_option_style);
    
            // Default first option as selected
            if (index === 0) {
                setSelectedStyle(button, colotrOptionChecked, colorOptionUnChecked, hoverborder);
                selectedOptions[categoryIndex] = { category, option }; // Store as an array item
            }
    
            // Click event to handle selection
            button.addEventListener("click", function () {
                // Remove selected styles from all buttons in the same category
                buttonGroup.querySelectorAll("button").forEach(btn => resetButtonStyle(btn, colorOptionUnChecked, colotrOptionChecked, borderColor));
    
                // Apply selected styles to clicked button
                setSelectedStyle(button, colotrOptionChecked, colorOptionUnChecked, hoverborder);
    
                // Update the selectedOptions array with the correct order
                selectedOptions[categoryIndex] = { category, option };
            });
    
            buttonGroup.appendChild(button);
        });
         optionContainer.appendChild(buttonGroup);
        targetElement.insertAdjacentElement("afterend", optionContainer);
    });

    const cartButton = document.getElementById("custom_cart_btn");
    cartButton.addEventListener("click", function () {
        const urlParams = new URLSearchParams(window.location.search);
        let variantId = urlParams.get('variant');
        const quantityInput = document.querySelector(`#Quantity-template--${numericId}__main`);

        // Check if the input exists and get its value
        const quantityValue = quantityInput ? quantityInput.value : null;
        
        if(!variantId){
            const productForm = document.querySelector('form[action="/cart/add"]');
            if (productForm) {
                // Look for a variant select dropdown or hidden input
                const variantSelect = productForm.querySelector('select[name="id"]');
                const variantInput = productForm.querySelector('input[name="id"]');
        
                if (variantSelect) {
                    // If a select dropdown is found, get the selected variant ID
                    const selectedVariantId = variantSelect.value;
                    console.log('Selected Variant ID:', selectedVariantId);
                } else if (variantInput) {
                    // If a hidden input is found, get its value (variant ID)
                    variantId = variantInput.value;
                    
                } else {
                    console.log('Variant ID not found in the product form.');
                }
            } else {
                console.log('Product form not found on the page.');
            }
        }
        console.log("Selected Options:", selectedOptions);
        console.log(Shopify.shop);
        console.log('Variant ID:', variantId);
        console.log(quantityValue ? `Quantity: ${quantityValue}` : 'Quantity input not found!');
        
    })
}

// Function to apply selected button styles
function setSelectedStyle(button, bgColorOption, txtColor, bordercolor) {
    Object.assign(button.style, {
        backgroundColor: bgColorOption,
        color: txtColor,
        borderColor: bordercolor
    });
}

// Function to reset button styles
function resetButtonStyle(button, bgColorOption, txtColor, bordercolor) {
    
    Object.assign(button.style, {
        backgroundColor: bgColorOption,
        color: txtColor,
        borderColor: bordercolor
    });
}
function getCart() {
    const value = `; ${document.cookie}`;
    var cookies = value.split(';');
    for (var i = 0; i < cookies.length; i++) {
        if (cookies[i].includes("cart=")) {
            return decodeURIComponent(cookies[i].split("cart=")[1]);
        }
    }
    return null;
}
function setCartCookie(cartId, shopName) {
    document.cookie = `cart=${encodeURIComponent(cartId)}; path=/; domain=.${shopName}; max-age=31536000; Secure; SameSite=Lax`;
}

function getMetafields(shopName, productId) {
    if (shopName && productId) {
        $.ajax({
            url: `https://9229-124-109-62-57.ngrok-free.app/GiftShip/GetMetafields?shopName=${shopName}&productId=${productId}`,
            type: "POST",
            contentType: "application/json;charset=utf-8",
            dataType: "json",
            success: function (data) {
                console.log("Metafields:", data);
                if (data) {
                    appendOptionsAsButtons(data);
                }
            },
            error: function (data, errorType, error) {
                console.error("Error fetching metafields:", error);
            }
        });
    }
}
