const activeValue = document.querySelector('.active-value');
const customSelect = document.querySelector('.custom-select');
const date = document.querySelector('.input-date');

const toggleSelect = () => {
    customSelect.classList.toggle("custom-select--is-shown");
    activeValue.classList.toggle("active-value--is-shown");
    customSelect.classList.contains("custom-select--is-shown")
        ? customSelect.focus()
        : customSelect.blur();

};
const changeSelect = () => {
    customSelect.classList.toggle("custom-select--is-shown");
    activeValue .classList.toggle("active-value--is-shown");
    activeValue.textContent =  customSelect.options[customSelect.selectedIndex].text;


};
const closedSelect = () => {
    customSelect.classList.remove("custom-select--is-shown");
    activeValue .classList.remove("active-value--is-shown");
};
const close = event => {
    if (activeValue.contains(event.target)) {
        return;
    }

    closedSelect();
};

const datepicker = new Datepicker(date, {
    format: 'dd/mm/yyyy',
    nextArrow: '→',
    prevArrow: '←',
});


activeValue.addEventListener("click", toggleSelect);
customSelect.addEventListener("click", changeSelect);
document.addEventListener("click", close);
