$(document).ready(() => {
    const dataWrapper = $("#root");
    const searchInputsWrapper = $("#searchInputs");
    const loader = $(".loader");

    loader.fadeOut(500, () => {
        loader.removeClass("loader-index");
    });
    $("body").css("overflow", "visible");

    /**
     ** nav bar
     */

    const toggleNav = () => {
        const isOpen = $(".nav-bar").css("left") === "0px";
        const boxWidth = $(".nav-bar .nav-tap").outerWidth();

        if (isOpen) {
            $(".nav-bar").animate({ left: -boxWidth }, 500);
            $(".toggler-icon").toggleClass("fa-align-justify fa-x");
            $(".links-list li").animate({ top: 300 }, 500);
        } else {
            $(".nav-bar").animate({ left: 0 }, 500);
            $(".toggler-icon").toggleClass("fa-align-justify fa-x");
            $(".links-list li").each(function (index) {
                $(this).animate({ top: 0 }, (index + 5) * 100);
            });
        }
    };

    toggleNav();

    $(".nav-bar i.toggler-icon").click(toggleNav);

    const getMeals = (data) => {
        let html = "";

        data.forEach(
            (item) =>
                (html += `
                <div class="col-md-3">
                    <div class="item-card position-relative overflow-hidden rounded-2 role-btn meal-card" data-meal-id="${item.idMeal}">
                        <img class="w-100" src="${item.strMealThumb}" alt="${item.strMeal}">
                        <div class="layer position-absolute d-flex align-items-center text-black p-2 justify-content-center ">
                            <h3>${item.strMeal}</h3>
                        </div>
                    </div>
                </div>`)
        );

        dataWrapper.html(html);
    };

    const getMealDeatails = async (id) => {
        try {
            dataWrapper.html("");
            searchInputsWrapper.html("");
            loader.show();

            const response = await fetch(
                `https://www.themealdb.com/api/json/v1/1/lookup.php?i=${id}`
            );
            if (!response.ok) {
                throw new Error(
                    `Failed to fetch meal details. Status: ${response.status}`
                );
            }

            const { meals } = await response.json();
            if (!meals || meals.length === 0) {
                throw new Error("No meal details found.");
            }

            const meal = meals[0];
            const ingredients = Array.from({ length: 20 }, (_, i) => {
                if (meal[`strIngredient${i + 1}`]) {
                    return `<li class="alert alert-info m-2 p-1">${
                        meal[`strMeasure${i + 1}`]
                    } ${meal[`strIngredient${i + 1}`]}</li>`;
                }
            }).join("");

            const tagsStr = meal.strTags
                ? meal.strTags
                      .split(",")
                      .map(
                          (tag) =>
                              `<li class="alert alert-danger m-2 p-1">${tag}</li>`
                      )
                      .join("")
                : "";

            const html = `
                <div class="col-md-4">
                    <img class="w-100 rounded-3" src="${meal.strMealThumb}" alt="">
                    <h2 class="mt-4" >${meal.strMeal}</h2>
                </div>
                <div class="col-md-8">
                    <h2>Instructions</h2>
                    <p>${meal.strInstructions}</p>
                    <h3><span class="fw-bolder">Area : </span>${meal.strArea}</h3>
                    <h3><span class="fw-bolder">Category : </span>${meal.strCategory}</h3>
                    <h3>Recipes :</h3>
                    <ul class="list-unstyled d-flex g-3 flex-wrap">
                        ${ingredients}
                    </ul>
                    <h3>Tags :</h3>
                    <ul class="list-unstyled d-flex g-3 flex-wrap">
                        ${tagsStr}
                    </ul>
                    <a target="_blank" href="${meal.strSource}" class="btn btn-success">Source</a>
                    <a target="_blank" href="${meal.strYoutube}" class="btn btn-danger">Youtube</a>
                </div>`;

            dataWrapper.html(html);
        } catch (error) {
            console.error("Error fetching meal details:", error.message);
            dataWrapper.html(`
                <h2 class="min-vh-100 d-flex text-center justify-content-center align-items-center ">
                    ${error.message}
                </h2>
            `);
        } finally {
            loader.fadeOut(300);
        }
    };

    $(document).on("click", ".meal-card", function () {
        const id = $(this).data("meal-id");
        getMealDeatails(id);
    });

    /**
     ** display categories
     */

    const getCategories = async () => {
        try {
            dataWrapper.html("");
            searchInputsWrapper.html("");
            loader.show();
            toggleNav();

            let response = await fetch(
                `https://www.themealdb.com/api/json/v1/1/categories.php`
            );
            if (!response.ok) {
                throw new Error(
                    `Failed to fetch categories. Status: ${response.status}`
                );
            }

            let responseData = await response.json();
            let html = "";
            responseData.categories.forEach((item) => {
                html += `
                    <div class="col-md-3">
                        <div class="cat item-card position-relative overflow-hidden rounded-2 role-btn" data-cat="${
                            item.strCategory
                        }">
                            <img class="w-100 p-3" src="${
                                item.strCategoryThumb
                            }" alt="${item.strCategory}">
                            <div class="layer position-absolute text-center text-black p-3">
                                <h3>${item.strCategory}</h3>
                                <p>${item.strCategoryDescription.substring(
                                    0,
                                    150
                                )}...</p>
                            </div>
                        </div>
                    </div>
                `;
            });
            dataWrapper.html(html);
        } catch (error) {
            dataWrapper.html(`
                <h2 class="min-vh-100 d-flex text-center justify-content-center align-items-center ">
                    ${error.message}
                </h2>
            `);
        } finally {
            loader.fadeOut(300);
        }
    };

    const getMealsByCat = async (category) => {
        dataWrapper.html("");
        loader.show();
        let response = await fetch(
            `https://www.themealdb.com/api/json/v1/1/filter.php?c=${category}`
        );
        response = await response.json();
        response.meals.length = 20;
        getMeals(response.meals);
        loader.fadeOut(300);
    };

    $(document).on("click", ".cat", function () {
        const category = $(this).data("cat");
        getMealsByCat(category);
    });

    $("#categories").click(() => getCategories());

    /**
     ** display areas
     */

    const getAreas = async () => {
        try {
            dataWrapper.html("");
            searchInputsWrapper.html("");
            loader.show();
            toggleNav();

            let response = await fetch(
                `https://www.themealdb.com/api/json/v1/1/list.php?a=list`
            );
            if (!response.ok) {
                throw new Error(
                    `Failed to fetch areas. Status: ${response.status}`
                );
            }

            let responseData = await response.json();
            let html = "";
            responseData.meals.forEach((meal) => {
                html += `
                    <div class="col-md-3">
                        <div class="text-center role-btn area" data-area=${meal.strArea}>
                            <i class="pb-3 fa-solid fa-house-laptop fa-4x"></i>
                            <h3>${meal.strArea}</h3>
                        </div>
                    </div>
                `;
            });
            dataWrapper.html(html);
        } catch (error) {
            dataWrapper.html(`
                <h2 class="min-vh-100 d-flex text-center justify-content-center align-items-center ">
                    ${error.message}
                </h2>
            `);
        } finally {
            loader.fadeOut(300);
        }
    };

    const getMealsByArea = async (area) => {
        dataWrapper.html("");
        loader.show();
        let response = await fetch(
            `https://www.themealdb.com/api/json/v1/1/filter.php?a=${area}`
        );
        response = await response.json();
        response.meals.length = 20;
        getMeals(response.meals);
        loader.fadeOut(300);
    };

    $(document).on("click", ".area", function () {
        const area = $(this).data("area");
        getMealsByArea(area);
    });

    $("#area").click(() => getAreas());

    /**
     ** display ingredients
     */

    const getIngredients = async () => {
        try {
            dataWrapper.html("");
            searchInputsWrapper.html("");
            loader.show();
            toggleNav();

            let response = await fetch(
                `https://www.themealdb.com/api/json/v1/1/list.php?i=list`
            );
            if (!response.ok) {
                throw new Error(
                    `Failed to fetch ingredients. Status: ${response.status}`
                );
            }

            let responseData = await response.json();
            let html = "";
            responseData.meals.forEach((ingredient) => {
                html += `
                    <div class="col-md-3">
                        <div class="text-center ingredient role-btn" data-ingredient="${
                            ingredient.strIngredient
                        }">
                            <i class="fa-solid fa-drumstick-bite fa-4x"></i>
                            <h3 class="py-3">${ingredient.strIngredient}</h3>
                            <p>${ingredient.strDescription.substring(
                                0,
                                150
                            )}...</p>
                        </div>
                    </div>
                `;
            });
            dataWrapper.html(html);
        } catch (error) {
            dataWrapper.html(`
                <h2 class="min-vh-100 d-flex text-center justify-content-center align-items-center ">
                    ${error.message}
                </h2>
            `);
        }
    };

    const getMealsByIngredients = async (ingredient) => {
        dataWrapper.html("");
        searchInputsWrapper.html("");
        loader.show();
        let response = await fetch(
            `https://www.themealdb.com/api/json/v1/1/filter.php?i=${ingredient}`
        );
        response = await response.json();
        response.meals.length = 20;
        getMeals(response.meals);
        loader.fadeOut(300);
    };

    $(document).on("click", ".ingredient", function () {
        const ingredient = $(this).data("ingredient");
        getMealsByIngredients(ingredient);
    });

    $("#ingredients").click(() => getIngredients());

    const displaySearchInputs = () => {
        loader.show();
        toggleNav();
        searchInputsWrapper.html(`
            <div class="row py-4">
                <div class="col-md-6">
                    <input id="searchByNameInput" class="form-control bg-transparent text-white" type="text" placeholder="Search By Name">
                </div>
                <div class="col-md-6">
                    <input id="searchByFirstLetterInput" class="form-control bg-transparent text-white" type="text" placeholder="Search By First Letter">
                </div>
            </div>
        `);

        dataWrapper.html("");
        loader.fadeOut(300);
    };

    $("#search").click(displaySearchInputs);

    $(document).on("keyup", "#searchByNameInput", function () {
        searchByName($(this).val());
    });

    $(document).on("keyup", "#searchByFirstLetterInput", function () {
        searchByFirstLetter($(this).val());
    });

    $(document).on("input", "#searchByFirstLetterInput", function () {
        if ($(this).val().length > 1) {
            $(this).val($(this).val().slice(1));
        }
    });

    const searchByName = async (key) => {
        loader.show();
        dataWrapper.html("");
        let response = await fetch(
            `https://www.themealdb.com/api/json/v1/1/search.php?s=${key}`
        );
        response = await response.json();
        response.meals ? getMeals(response.meals) : getMeals([]);
        loader.fadeOut(300);
    };

    const searchByFirstLetter = async (key) => {
        loader.show();
        dataWrapper.html("");
        let response = await fetch(
            `https://www.themealdb.com/api/json/v1/1/search.php?s=${key}`
        );
        response = await response.json();
        response.meals ? getMeals(response.meals) : getMeals([]);
        loader.fadeOut(300);
    };

    searchByName("");

    const adContactForm = () => {
        toggleNav();
        loader.show();
        dataWrapper.html(`
        <div class="min-vh-100 d-flex justify-content-center align-items-center container text-center">
            <form class="row g-4 align-items-center">
                <div class="col-md-6">
                    <input id="name" name="name"  type="text" class="form-control" placeholder="Enter Your Name">
                    <div id="nameAlert" class="alert alert-danger w-100 mt-2 d-none">
                        Special characters and numbers not allowed
                    </div>
                </div>
                <div class="col-md-6">
                    <input id="email" name="email" type="email" class="form-control " placeholder="Enter Your Email">
                    <div id="emailAlert" class="alert alert-danger w-100 mt-2 d-none">
                        Email not valid *exemple@yyy.zzz
                    </div>
                </div>
                <div class="col-md-6">
                    <input id="phone" name="phone" type="text" class="form-control " placeholder="Enter Your Phone">
                    <div id="phoneAlert" class="alert alert-danger w-100 mt-2 d-none">
                        Enter valid Phone Number
                    </div>
                </div>
                <div class="col-md-6">
                    <input id="age" name="age" type="number" class="form-control " placeholder="Enter Your Age">
                    <div id="ageAlert" class="alert alert-danger w-100 mt-2 d-none">
                        Eage muste be between 18 & 70
                    </div>
                </div>
                <div class="col-md-6">
                    <input  id="password" name="password" type="password" class="form-control " placeholder="Enter Your Password">
                    <div id="passwordAlert" class="alert alert-danger w-100 mt-2 d-none">
                        Enter valid password *Minimum eight characters, at least one letter and one number:*
                    </div>
                </div>
                <div class="col-md-6">
                    <input  id="repassword" name="repassword" type="password" class="form-control " placeholder="Repassword">
                    <div id="repasswordAlert" class="alert alert-danger w-100 mt-2 d-none">
                        repassword don't match the password
                    </div>
                </div>
                <button id="submitBtn" disabled class="btn btn-outline-danger px-2 mt-3 mx-auto w-auto">Submit</button>
            </form>
        </div> `);

        const containsSpecialCharactersOrNumbers = (value) => {
            const pattern = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+/;
            const containsSpecialChars = pattern.test(value);
            const containsNumbers = /\d/.test(value);
            return containsSpecialChars || containsNumbers;
        };

        const isValidEmail = (email) => {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            return emailRegex.test(email);
        };

        const isValidPhoneNumber = (phone) => {
            const phoneRegex = /^\d{10}$/;
            return phoneRegex.test(phone);
        };

        const isValidAge = (age) => {
            return age >= 18 && age <= 70;
        };

        const isValidPassword = (password) => {
            const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;
            return passwordRegex.test(password);
        };

        const passwordsMatch = (password, repassword) => {
            return password === repassword;
        };

        $("#name").keyup(function () {
            const value = $(this).val();
            const containsSpecialCharsOrNumbers =
                containsSpecialCharactersOrNumbers(value);
            $("#nameAlert").toggleClass(
                "d-none",
                !containsSpecialCharsOrNumbers
            );
        });

        $("#email").keyup(function () {
            const value = $(this).val();
            const validEmail = isValidEmail(value);
            $("#emailAlert").toggleClass("d-none", validEmail);
        });

        $("#phone").keyup(function () {
            const value = $(this).val();
            const validPhoneNumber = isValidPhoneNumber(value);
            $("#phoneAlert").toggleClass("d-none", validPhoneNumber);
        });

        $("#age").keyup(function () {
            const value = $(this).val();
            const validAge = isValidAge(value);
            $("#ageAlert").toggleClass("d-none", validAge);
        });

        $("#password").keyup(function () {
            const value = $(this).val();
            const validPassword = isValidPassword(value);
            $("#passwordAlert").toggleClass("d-none", validPassword);
        });

        $("#repassword").keyup(function () {
            const passwordsMatch = $("#password").val() === $(this).val()

            $("#repasswordAlert").toggleClass("d-none", passwordsMatch);
        });

        const areAllFieldsValid = () => {
            const nameValid = !containsSpecialCharactersOrNumbers(
                $("#name").val()
            );
            const emailValid = isValidEmail($("#email").val());
            const phoneValid = isValidPhoneNumber($("#phone").val());
            const ageValid = isValidAge($("#age").val());
            const passwordValid = isValidPassword($("#password").val());
            const repasswordValid = passwordsMatch(
                $("#password").val(),
                $("#repassword").val()
            );

            return (
                nameValid &&
                emailValid &&
                phoneValid &&
                ageValid &&
                passwordValid &&
                repasswordValid
            );
        };

        const toggleSubmitButton = () => {
            $("#submitBtn").prop("disabled", !areAllFieldsValid());
        };

        $("#name, #email, #phone, #age, #password, #repassword").keyup(
            function () {
                toggleSubmitButton();
            }
        );

        loader.fadeOut(300);
    };

    $("#contact-us").on("click", function () {
        adContactForm();
    });
});
