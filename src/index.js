import './css/common.css';
import ApiService from './js/apiService.js';
import imageCard from './templates/images.hbs';

import '@pnotify/core/dist/PNotify.css';
import '@pnotify/core/dist/BrightTheme.css';
import '@pnotify/mobile/dist/PNotifyMobile.css';
import '@pnotify/countdown/dist/PNotifyCountdown.css';
import { alert } from '@pnotify/core';
import notification from './js/notification.js';
import * as basicLightbox from 'basiclightbox';

const refs = {
    
    body: document.querySelector('body'),
    searchForm: document.querySelector('#search-form'),
    gallery: document.querySelector('.gallery'),
    anchor: document.querySelector('.anchor'),
}


const apiService = new ApiService();
const observer = new IntersectionObserver(observerCallback, {
    threshold: 0,
});


refs.searchForm.addEventListener('submit', onSearch);
window.addEventListener('scroll', onAddObserver);

function observerCallback() {
    onLoadMore();
}

function onAddObserver() {
observer.observe(refs.anchor);
}

async function onSearch(e) {
    e.preventDefault();
    
    apiService.query = e.currentTarget.elements.query.value.trim();
    
    
    apiService.resetPage();
    clearGallery();
    await fetchImages();
    
    const fetchTotalHits = await apiService.fetchTotalHits();
    if (fetchTotalHits === 0) {
        return alert(notification.incorrectQuery);
    }

    if (apiService.query === '') {
        return alert(notification.notMachResults);
    }
    if (fetchTotalHits > 0) {
        notification.successResult.title =  `Found ${fetchTotalHits} ${apiService.query} images`,
        alert(notification.successResult);
    }
}

async function fetchImages() {
    if (apiService.query === '') {
        return;
    }

    const response = await apiService.fetchImages();
    const images = await createGallery(response);
    return images;
}

function createGallery(images) {
    refs.gallery.insertAdjacentHTML('beforeend', imageCard(images));
}

function clearGallery() {
    refs.gallery.innerHTML = '';
}

async function onLoadMore() {
    await fetchImages();
    const fetchTotalHits = await apiService.fetchTotalHits()
    if (refs.gallery.children.length >= fetchTotalHits) {
        observer.unobserve(refs.anchor);
        alert(notification.imagesAreOver);
    }
}

