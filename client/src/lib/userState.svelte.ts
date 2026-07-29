// src/lib/userState.ts
import { browser } from '$app/environment';

class UserState {
    nickname = $state<string>(
        browser ? localStorage.getItem('nickname') ?? '' : ''
    );

    setNickname(newNickname: string) {
        this.nickname = newNickname;
        if (browser) {
            localStorage.setItem('nickname', newNickname);
        }
    }

    clear() {
        this.nickname = '';
        if (browser) {
            localStorage.removeItem('nickname');
        }
    }
}

export const userState = new UserState();