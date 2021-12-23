import { browser, by, element } from 'protractor';

export const timeInitial = 1000; // 2 second;
export const timeWait = 500; // 0.5 second;
export const timeDisplay = 5000; // 5 second;

export class CoreUIPage {
  navigateTo() {
    return browser.get('/dashboard');
  }

  getParagraphText() {
    console.log(element(by.className('app-footer')).getSize());
    return element(by.className('app-footer')).getTagName();
  }
}

export class DashboardPage {
  navigateTo() {
    return browser.get('/dashboard');
  }

  clickSomeRequest() {
    element
      .all(by.className('btn btn-sm btn-light'))
      .first()
      .click();
  }

  clickBackOnRequestPAge() {
    element
      .all(by.className('btn btn-sm btn-light'))
      .last()
      .click();
  }
}

export class LoginPage {
  wait() {
    return browser.sleep(8000);
  }

  navigateTo() {
    return browser.get('/');
  }

  patch(id: string, value: string) {
    return element(by.id(id)).sendKeys(value);
  }

  clickLogin() {
    return element(by.id('login')).click();
  }

  clickSubmit() {
    return element(by.id('btnLogin')).click();
  }

  clickCancel() {
    return element(by.id('btnCancel')).click();
  }

  clickConfirm() {
    return element(by.className('swal2-confirm btn btn-success mr-2')).click();
  }
}
