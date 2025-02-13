let url = null;

if (typeof jQuery == 'undefined') {
    var script = document.createElement("script");
    script.src = "https://ajax.googleapis.com/ajax/libs/jquery/3.6.0/jquery.min.js";
    script.type = "text/javascript";
    script.onload = function () {
        console.log("jQuery loaded successfully.");
        makeAjaxCall(); // Call the function after jQuery loads
    };
    document.head.appendChild(script);
} else {
    makeAjaxCall(); // If jQuery is already loaded, call immediately
}

function makeAjaxCall() {
    $.ajax({
        url: `https://41b9-124-109-62-57.ngrok-free.app/GiftShip/GetAppUrl`,
        type: "POST",
        contentType: "application/json;charset=utf-8",
        dataType: "json",
        success: function (data) {
            console.log(data.url);
            if (data) {
                url = data.url;
                console.log("url : ", url);
            }
        },
        error: function (data, errorType, error) {
            console.error("Error fetching metafields:", error);
        }
    });
}



if (window.location.pathname.includes("/products/")) {

    const productForm = document.querySelector('form[action="/cart/add"]');
    if (!productForm) {
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

    if (typeof jQuery == 'undefined') {
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
        let cartToken = getCart();
        if (cartToken) {
            cartId = "gid://shopify/Cart/" + cartToken;
            getMetafields(shopName, productId); // Call GetMetafields immediately
        } else {
            $.ajax({
                url: `${url}GiftShip/CreateCart?shopName=${shopName}`,
                type: "POST",
                contentType: "application/json;charset=utf-8",
                dataType: "json",
                success: function (data) {
                    console.log(data)
                    if (data.cartToken != null) {
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
    const marigoldButtton = document.getElementById("add-to-cart-button");
    let numericId = null;

    if (templateElement) {
        const match = templateElement.id.match(/template--(\d+)/);
        if (match) {
            numericId = match[1];
        }
    }
    else {

    }

    // Try to find the existing Add to Cart button
    let addToCartButton = numericId
        ? document.querySelector(`[id*='ProductSubmitButton-template--${numericId}']`)
        : document.querySelector("button[name='add'].product-form__cart-submit");
    if (!addToCartButton && marigoldButtton) {
        addToCartButton = marigoldButtton;
    }

    // If an Add to Cart button is found, clone it (without event listeners)
    let customAddToCartButton;
    if (addToCartButton) {
        customAddToCartButton = addToCartButton.cloneNode(true);
        customAddToCartButton.id = "custom_cart_btn";
        customAddToCartButton.name = "add_to_cart";
        customAddToCartButton.type = "button"; // Change type to button to prevent default form submission
        customAddToCartButton.removeAttribute("fdprocessedid"); // Remove Shopify-processed ID
        customAddToCartButton.innerHTML = `
            <span>Add to cart</span>
            <div class="loading__spinner hidden">
                <svg aria-hidden="true" focusable="false" class="spinner" viewBox="0 0 66 66" xmlns="http://www.w3.org/2000/svg">
                    <circle class="path" fill="none" stroke-width="6" cx="33" cy="33" r="30"></circle>
                </svg>
            </div>
        `;
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
        customAddToCartButton.value = "Adding...";
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
                customAddToCartButton.value = "Add to cart";

                console.log("Button pressed..");
            }
            customAddToCartButton.disabled = false;
        }, 1000);


    });

    // Find the Checkout button container
    const checkoutButtonContainer = document.querySelector("div[data-shopify='payment-button']");
    let targetEl = null
    if (checkoutButtonContainer) {
        targetEl = checkoutButtonContainer;
    }
    else if (marigoldButtton) {
        targetEl = marigoldButtton;
    }


    // Insert the custom button before the checkout button
    targetEl.parentNode.insertBefore(customAddToCartButton, targetEl);

    // Hide the original Add to Cart button if found
    if (addToCartButton) {
        addToCartButton.style.display = "none";
    }

    const selectedOptions = {};
    let targetElement = document.getElementById(`variant-selects-template--${numericId}__main`);
    let marigoldQuantity = null;
    let element = document.querySelector('.color-scheme-4');
    let colotrOptionChecked = getComputedStyle(document.querySelector('.product-form__input.product-form__input--pill') || document.documentElement).getPropertyValue('--color-background').trim() || '#fff';
    let bgOptionChecked = getComputedStyle(document.querySelector('.product-form__input.product-form__input--pill') || document.documentElement).getPropertyValue('--color-foreground').trim() || '#000000';

    let colorOptionUnChecked = getComputedStyle(document.querySelector('.product-form__input.product-form__input--pill') || document.documentElement).getPropertyValue('--color-foreground').trim() || '#000000';
    let bgOptionUnchecked = getComputedStyle(document.querySelector('.product-form__input.product-form__input--pill') || document.documentElement).getPropertyValue('--color-background').trim() || '#fff';

    let optionRadius = getComputedStyle(document.querySelector('.product-form__input.product-form__input--pill') || document.documentElement).getPropertyValue('--variant-pills-radius').trim() || '20px';
    let optionBorderWidth = getComputedStyle(document.querySelector('.product-form__input.product-form__input--pill') || document.documentElement).getPropertyValue('--variant-pills-border-width').trim() || '1px';
    let optionBorderOpacity = getComputedStyle(document.querySelector('.product-form__input.product-form__input--pill') || document.documentElement).getPropertyValue('--variant-pills-border-opacity').trim() || '1';
    let font = getComputedStyle(document.querySelector('.product-form__input.product-form__input--pill') || document.documentElement).getPropertyValue('--font-body-family').trim() || "";
    let borderColor = `rgb${bgOptionChecked}`;
    let hoverborder = `rgb(${bgOptionChecked}, 1)`;
    if (bgOptionChecked.includes(',')) {
        borderColor = `rgb(${bgOptionChecked}, ${optionBorderOpacity})`;
        bgOptionChecked = `rgb(${bgOptionChecked})`;
        colotrOptionChecked = `rgb(${colotrOptionChecked})`

    }
    if (bgOptionUnchecked.includes(',')) {
        bgOptionUnchecked = `rgb(${bgOptionUnchecked})`;
        colorOptionUnChecked = `rgb(${colorOptionUnChecked})`
    }


    if (!targetElement) {
        marigoldQuantity = $("h5").filter(function () {
            return $(this).text().trim() === "Quantity";
        });
    }
    if (marigoldQuantity) {
        colotrOptionChecked = "#fff";
        colorOptionUnChecked = "#b9b9b9";
        bgOptionChecked = "#e2dbce";
        bgOptionUnchecked = "#eeece8"
        optionRadius = "0px";
        optionBorderWidth = "2px";
        optionBorderOpacity = "1";
        font = "Raleway, sans-serif";
        borderColor = "#ffffff";
        hoverborder = "#ffffff";
    }

    Object.keys(optionsData).forEach((key, categoryIndex) => {
        const optionContainer = document.createElement("div");
        optionContainer.style.margin = "20px 0";

        // Key (Category) title
        const keyTitle = document.createElement("legend");
        keyTitle.className = "form__label";

        optionContainer.prepend(keyTitle);
        keyTitle.textContent = key;
        optionContainer.appendChild(keyTitle);

        if (marigoldQuantity) {
            keyTitle.style.setProperty("letter-spacing", ".15em", "important");
            keyTitle.style.setProperty("font-family", "Raleway, sans-serif", "important");
            keyTitle.style.setProperty("font-size", "13px", "important");
        }

        // Button group container
        const buttonGroup = document.createElement("div");
        buttonGroup.style.display = "flex";
        buttonGroup.style.flexWrap = "wrap";
        buttonGroup.style.gap = "10px";
        buttonGroup.classList.add("option_div_custom")

        optionsData[key].forEach((value, index) => {
            const button = document.createElement("button");
            button.type = "button";
            button.textContent = value;
            button.dataset.value = value; // Store the value in dataset
            button.dataset.key = key; // Store key name
            button.classList.add('custom_optin_btn');
            let custom_option_style = document.createElement("style");
            // Apply base styles
            if (marigoldQuantity) {
                Object.assign(button.style, {
                    padding: "10px 20px",
                    fontFamily: "Raleway, sans-serif",
                    border: `${optionBorderWidth} solid ${borderColor}`,
                    backgroundColor: bgOptionUnchecked,
                    color: colorOptionUnChecked,
                    cursor: "pointer",
                    borderRadius: optionRadius,
                    fontSize: "12px",
                    fontWeight: "800",
                    minWidth: "fit-content",
                    transition: "all 0.3s ease"
                });

                // Apply !important to each property
                button.style.setProperty("padding", "10px 20px", "important");
                button.style.setProperty("font-family", "Raleway, sans-serif", "important");
                button.style.setProperty("border", `${optionBorderWidth} solid ${borderColor}`, "important");
                button.style.setProperty("background-color", bgOptionUnchecked, "important");
                button.style.setProperty("color", colorOptionUnChecked, "important");
                button.style.setProperty("cursor", "pointer", "important");
                button.style.setProperty("border-radius", optionRadius, "important");
                button.style.setProperty("font-size", "11px", "important");
                button.style.setProperty("font-weight", "800", "important");
                button.style.setProperty("max-width", "fit-content", "important");
                button.style.setProperty("transition", "all 0.3s ease", "important");
                button.style.setProperty("max-height", "fit-content", "important");
                button.style.setProperty("margin-bottom", "0px", "important");

                custom_option_style = document.createElement("style");
                custom_option_style.textContent = `
					.custom_optin_btn:hover {
						border: ${optionBorderWidth} solid ${hoverborder} !important;
						cursor: pointer;
					}
				`;
                document.head.appendChild(custom_option_style);
            } else {
                Object.assign(button.style, {
                    padding: "10px 20px",
                    fontFamily: font,
                    border: `${optionBorderWidth} solid ${borderColor}`,
                    backgroundColor: bgOptionUnchecked,
                    color: colorOptionUnChecked,
                    cursor: "pointer",
                    borderRadius: optionRadius,
                    fontSize: "14px",
                    transition: "all 0.3s ease"
                });
                custom_option_style = document.createElement("style");
                custom_option_style.textContent = `
					.custom_optin_btn:hover {
						border: ${optionBorderWidth} solid ${hoverborder} !important;
						cursor: pointer;
					}
				`;
                document.head.appendChild(custom_option_style);
            }

            // Default first value as selected
            if (index === 0) {
                setSelectedStyle(button, bgOptionChecked, colotrOptionChecked, hoverborder);
                selectedOptions[categoryIndex] = { key, value }; // Store as an array item
            }

            // Click event to handle selection
            button.addEventListener("click", function () {
                // Remove selected styles from all buttons in the same key group
                buttonGroup.querySelectorAll("button").forEach(btn => resetButtonStyle(btn, bgOptionUnchecked, colorOptionUnChecked, borderColor));

                // Apply selected styles to clicked button
                setSelectedStyle(button, bgOptionChecked, colotrOptionChecked, hoverborder);

                // Update the selectedOptions array with the correct order
                selectedOptions[categoryIndex] = { key, value };
            });

            buttonGroup.appendChild(button);
        });

        optionContainer.appendChild(buttonGroup);
        if (targetElement) {
            targetElement.insertAdjacentElement("afterend", optionContainer);
        }
        else if (marigoldQuantity) {
            marigoldQuantity.prepend(optionContainer);
        }

    });


    const cartButton = document.getElementById("custom_cart_btn");
    cartButton.addEventListener("click", function () {

        const urlParams = new URLSearchParams(window.location.search);
        let variantId = urlParams.get('variant');
        let quantityInput = document.querySelector(`#Quantity-template--${numericId}__main`);
        let marigoldQuantityInput = document.getElementById("quantity");
        let shop = Shopify.shop;
        let cartToken = getCart();
        let cartId = null;
        if (cartToken) {
            cartId = "gid://shopify/Cart/" + cartToken;
        }
        // Check if the input exists and get its value
        let quantityValue = quantityInput ? quantityInput.value : null;
        if (!quantityValue) {
            quantityValue = marigoldQuantityInput.value;
        }

        if (!variantId) {
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
        addToCart(shop, cartId, variantId, quantityValue, selectedOptions);
    });

    if (!marigoldButtton) {
        let originalPaymentButton = document.querySelector(".shopify-payment-button");

        if (originalPaymentButton) {
            // Create a new button
            let newButton = document.createElement("button");
            newButton.type = "button";
            newButton.textContent = "Buy it now";
            newButton.className = "shopify-payment-button__button shopify-payment-button__button--unbranded";

            // Add click event listener
            newButton.addEventListener("click", function () {
                const urlParams = new URLSearchParams(window.location.search);
                let variantId = urlParams.get('variant');
                let quantityInput = document.querySelector(`#Quantity-template--${numericId}__main`);
                let marigoldQuantityInput = document.getElementById("quantity");
                let shop = Shopify.shop;
                let cartToken = getCart();
                let cartId = null;
                if (cartToken) {
                    cartId = "gid://shopify/Cart/" + cartToken;
                }
                // Check if the input exists and get its value
                let quantityValue = quantityInput ? quantityInput.value : null;
                if (!quantityValue) {
                    quantityValue = marigoldQuantityInput.value;
                }

                if (!variantId) {
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
                directCheckou6t(shop, variantId, quantityValue, selectedOptions)
            });

            // Insert the new button before the original payment button
            originalPaymentButton.parentNode.insertBefore(newButton, originalPaymentButton);
            originalPaymentButton.style.display = "none";
        }
    }
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
            url: `${url}GiftShip/GetMetafields?shopName=${shopName}&productId=${productId}`,
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

if (window.location.pathname.endsWith("/cart") || window.location.pathname.endsWith("/cart/")) {
    if (typeof jQuery == 'undefined') {
        var script = document.createElement("script");
        script.src = "https://ajax.googleapis.com/ajax/libs/jquery/3.6.0/jquery.min.js";
        script.type = "text/javascript";
        script.onload = function () {
            console.log("jQuery loaded successfully.");
            //runAfterjQueryLoads(); // Run your AJAX calls here
        };
        document.head.appendChild(script);
    }
    const metafiledOption = localStorage.getItem("metafieldOption"); // Assuming you stored it previously
    if (metafiledOption) {
        var originalButton = document.getElementById("checkout");
        var marigoldCheckout = document.querySelector('input[name="button-route-2"]');
        var customButton = originalButton.cloneNode(true);

        // Change the ID of the duplicated button
        customButton.id = "custom_cart_checkout";

        // Set the type to 'button' and remove any form-related attributes
        customButton.type = "button";
        customButton.removeAttribute("form");
        customButton.removeAttribute("data-route-ref");
        customButton.name = "custom_checkout";

        if (marigoldCheckout) {
            marigoldCheckout.before(customButton);
            marigoldCheckout.style.display = "none";
            customButton.style.display = "inline-block !important";
        }
        else {
            originalButton.parentNode.insertBefore(customButton, originalButton);
            originalButton.style.display = "none";
        }
        customButton.style.setProperty("display", "inline-block", "important");
        // Insert the new button before the original button


        // Hide the original button


        // Add styles dynamically
        function addStyles() {
            var style = document.createElement("style");
            style.innerHTML = `
            .loader {
              border: 4px solid transparent;
              border-top: 4px solid #3498db;
              border-radius: 50%;
              width: 20px;
              height: 20px;
              margin-left: 10px;
              animation: spin 1s linear infinite;
            }
        
            /* Loader spinning animation */
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `;
            document.head.appendChild(style);
        }

        addStyles(); // Add styles to the document

        // Add event listener to the custom button
        customButton.addEventListener("click", function (event) {
            // Disable the button and change its appearance
            customButton.disabled = true;
            customButton.style.cursor = "not-allowed";
            var dataToSend = getGiftMessageData();

            var loader = document.createElement("div");
            loader.classList.add("loader");
            let shopName = Shopify.shop;
            let cartToken = getCart();
            let cartId = null;
            if (cartToken) {
                cartId = "gid://shopify/Cart/" + cartToken;
            }
            if (shopName && cartId) {
                customButton.innerHTML = 'Processing...';
                customButton.appendChild(loader);

                $.ajax({
                    url: `${url}GiftShip/MetafieldsCheckout?ShopName=${shopName}&CartId=${cartId}`,
                    type: "POST",
                    contentType: "application/json;charset=utf-8",
                    dataType: "json",
                    success: function (data) {

                        if (data) {
                            customButton.disabled = false;
                            customButton.style.backgroundColor = "";
                            customButton.style.cursor = "";
                            customButton.innerHTML = 'Check out';
                            window.location.href = data.url;
                        } else {
                            customButton.disabled = false;
                            customButton.style.backgroundColor = "";
                            customButton.style.cursor = "";
                            customButton.innerHTML = 'Check out';
                            console.error("Error in creating metafield checkout");
                        }
                    },
                    error: function (data, errorType, error) {
                        customButton.disabled = false;
                        customButton.style.backgroundColor = "";
                        customButton.style.cursor = "";
                        customButton.innerHTML = 'Check out';
                        console.error("Error fetching metafields:", error);
                    }
                });
            }
        });

    } else {
        console.log("No checkout URL found.");
    }
}
function getGiftMessageData() {
    var toMessage = document.getElementById("to_message")?.value || "";
    var fromMessage = document.getElementById("from_message")?.value || "";
    var message = document.getElementById("gsMessage")?.value || "";

    // Create JSON object
    var giftMessageData = {
        to: toMessage,
        from: fromMessage,
        message: message
    };
    console.log(giftMessageData);
    return giftMessageData;
}

function addToCart(ShopName, CartId, MerchandiseId, quantity, options) {
    if (ShopName) {
        var customAddToCartButton = document.getElementById("custom_cart_btn");
        const loader = customAddToCartButton.querySelector(".loading__spinner");
        customAddToCartButton.value = "Adding...";
        const buttonText = customAddToCartButton.querySelector("span");

        if (loader && buttonText) {
            loader.classList.remove("hidden");
            buttonText.textContent = "Adding...";
        }
        $.ajax({
            url: `${url}GiftShip/CustomCartLineAdd?ShopName=${ShopName}&CartId=${CartId}&MerchandiseId=${MerchandiseId}&Quantity=${quantity}`,
            data: JSON.stringify(options),
            type: "POST",
            contentType: "application/json",
            dataType: "json",
            success: function (data) {
                console.log("CartLineAddResponse:", data);
                if (data) {
                    let popup = document.getElementById("cart-notification");
                    if (data.cartId != CartId) {
                        setCartCookie(data.cartId.split("Cart/")[1], ShopName);
                        if (popup) {
                            popup.classList.add("active");
                        }
                        // location.reload();
                    } else {
                        if (popup) {
                            popup.classList.add("active");
                        }
                        // location.reload();
                    }
                }
                if (loader && buttonText) {
                    loader.classList.add("hidden");
                    customAddToCartButton.value = "Add to cart";
                    buttonText.textContent = "Add to cart";

                    console.log("Button pressed..");
                }
                customAddToCartButton.disabled = false;
                var metafieldOption = localStorage.getItem("metafieldOption") || null;

                if (!metafieldOption) {
                    localStorage.setItem("metafieldOption", "true");
                }
                // location.reload();
            },
            error: function (data, errorType, error) {
                console.error("Error fetching metafields:", error);
            }
        });
    }
}

function directCheckou6t(ShopName, MerchandiseId, quantity, options) {
    if (ShopName) {
        $.ajax({
            url: `${url}GiftShip/CreateDirectCheckout?ShopName=${ShopName}&MerchandiseId=${MerchandiseId}&Quantity=${quantity}`,
            data: JSON.stringify(options),
            type: "POST",
            contentType: "application/json",
            dataType: "json",
            success: function (data) {
                if (data) {
                    // setCartCookie(data.cartId, ShopName);
                    console.log(data);
                    window.location.href = data.url;
                }
            },
            error: function (data, errorType, error) {
                console.error("Error fetching metafields:", error);
            }
        });
    }
}
