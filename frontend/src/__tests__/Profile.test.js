import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import Profile from '../src/views/Profile.vue';
import { createPinia, setActivePinia } from 'pinia';

describe('Profile Component', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  it('muestra puntos iniciales', () => {
    const wrapper = mount(Profile);
    expect(wrapper.find('.text-h4').text()).toBe('0');  // Puntos default
  });
});
