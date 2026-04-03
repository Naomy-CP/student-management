require('chromedriver');
const { Builder, By, until } = require('selenium-webdriver');
const assert = require('assert');
const fs = require('fs');

const URL = 'https://naomy-cp.github.io/student-management';
const USUARIO = 'admin';
const PASSWORD = 'admin123';
const TIMEOUT = 15000;
const PAUSA = 2000;

async function tomarCaptura(driver, nombre) {
    if (!fs.existsSync('capturas')) fs.mkdirSync('capturas');
    const imagen = await driver.takeScreenshot();
    fs.writeFileSync(`capturas/${nombre}.png`, imagen, 'base64');
}

async function cerrarAlerta(driver) {
    try {
        const alerta = await driver.switchTo().alert();
        await alerta.accept();
    } catch (e) {}
}

async function hacerLogin(driver) {
    await driver.get(URL);
    await driver.sleep(5000);
    await driver.findElement(By.id('loginUsuario')).sendKeys(USUARIO);
    await driver.findElement(By.id('loginPassword')).sendKeys(PASSWORD);
    await driver.sleep(2000);
    await driver.findElement(By.id('btnLogin')).click();
    await driver.wait(until.elementIsVisible(
        await driver.findElement(By.id('main-section'))), TIMEOUT);
    await driver.sleep(5000);
}

describe('Pruebas Automatizadas - Gestión de Estudiantes', function () {
    this.timeout(120000);
    let driver;

    before(async function () {
        driver = await new Builder().forBrowser('chrome').build();
        await driver.manage().window().maximize();
    });

    after(async function () {
        await driver.quit();
    });

    // HISTORIA 1: Login
    describe('HU-01: Inicio de Sesión', function () {
        it('Camino feliz: login correcto', async function () {
            await driver.get(URL);
            await driver.sleep(5000);
            await driver.findElement(By.id('loginUsuario')).sendKeys(USUARIO);
            await driver.sleep(1000);
            await driver.findElement(By.id('loginPassword')).sendKeys(PASSWORD);
            await driver.sleep(1000);
            await driver.findElement(By.id('btnLogin')).click();
            await driver.wait(until.elementIsVisible(
                await driver.findElement(By.id('main-section'))), TIMEOUT);
            await driver.sleep(3000);
            await tomarCaptura(driver, 'HU01-camino-feliz');
        });

        it('Prueba negativa: login incorrecto', async function () {
            await driver.get(URL);
            await driver.sleep(3000);
            await driver.findElement(By.id('loginUsuario')).sendKeys('usuario_malo');
            await driver.sleep(1000);
            await driver.findElement(By.id('loginPassword')).sendKeys('password_malo');
            await driver.sleep(1000);
            await driver.findElement(By.id('btnLogin')).click();
            await driver.sleep(3000);
            await tomarCaptura(driver, 'HU01-prueba-negativa');
        });

        it('Prueba de límites: campos vacíos', async function () {
            await driver.get(URL);
            await driver.sleep(3000);
            await driver.findElement(By.id('btnLogin')).click();
            await driver.sleep(3000);
            await tomarCaptura(driver, 'HU01-prueba-limites');
        });
    });

    // HISTORIA 2: Agregar estudiante
    describe('HU-02: Agregar Estudiante', function () {
        before(async function () {
            await hacerLogin(driver);
        });

        it('Camino feliz: agregar estudiante válido', async function () {
            await driver.findElement(By.id('nombre')).sendKeys('Ana Martinez');
            await driver.sleep(1000);
            await driver.findElement(By.id('matricula')).sendKeys('2024-0099');
            await driver.sleep(1000);
            await driver.findElement(By.id('carrera')).sendKeys('Ingeniería en Sistemas');
            await driver.sleep(1000);
            await driver.findElement(By.id('indice_academico')).sendKeys('3.75');
            await driver.sleep(2000);
            await driver.findElement(By.id('btnGuardar')).click();
            await driver.sleep(2000);
            await cerrarAlerta(driver);
            await driver.sleep(3000);
            await tomarCaptura(driver, 'HU02-camino-feliz');
        });

        it('Prueba negativa: agregar estudiante con campos vacíos', async function () {
            await driver.sleep(2000);
            await driver.executeScript("window.alert = () => {}");
            await driver.findElement(By.id('btnGuardar')).click();
            await driver.sleep(3000);
            await tomarCaptura(driver, 'HU02-prueba-negativa');
        });

        it('Prueba de límites: índice académico en límite máximo', async function () {
            await driver.findElement(By.id('nombre')).sendKeys('Pedro Límite');
            await driver.sleep(1000);
            await driver.findElement(By.id('matricula')).sendKeys('2024-0100');
            await driver.sleep(1000);
            await driver.findElement(By.id('carrera')).sendKeys('Medicina');
            await driver.sleep(1000);
            await driver.findElement(By.id('indice_academico')).sendKeys('4.00');
            await driver.sleep(2000);
            await driver.findElement(By.id('btnGuardar')).click();
            await driver.sleep(2000);
            await cerrarAlerta(driver);
            await driver.sleep(3000);
            await tomarCaptura(driver, 'HU02-prueba-limites');
        });
    });

    // HISTORIA 3: Buscar estudiante
    describe('HU-03: Buscar Estudiante', function () {
        before(async function () {
            await hacerLogin(driver);
        });

        it('Camino feliz: buscar estudiante existente', async function () {
            await driver.findElement(By.id('busqueda')).sendKeys('Ana');
            await driver.sleep(5000);
            await tomarCaptura(driver, 'HU03-camino-feliz');
        });

        it('Prueba negativa: buscar estudiante inexistente', async function () {
            await driver.findElement(By.id('busqueda')).sendKeys('zzzznoexiste');
            await driver.sleep(5000);
            await tomarCaptura(driver, 'HU03-prueba-negativa');
        });

        it('Prueba de límites: buscar con un solo carácter', async function () {
            await driver.findElement(By.id('busqueda')).sendKeys('A');
            await driver.sleep(5000);
            await tomarCaptura(driver, 'HU03-prueba-limites');
        });
    });

    // HISTORIA 4: Editar estudiante
    describe('HU-04: Editar Estudiante', function () {
        before(async function () {
            await hacerLogin(driver);
        });

        it('Camino feliz: editar estudiante existente', async function () {
            await driver.sleep(5000);
            const botones = await driver.findElements(By.css('.btn-warning'));
            if (botones.length > 0) {
                await driver.executeScript("arguments[0].scrollIntoView(true);", botones[0]);
                await driver.sleep(2000);
                await driver.executeScript("arguments[0].click();", botones[0]);
                await driver.sleep(3000);
                const indice = await driver.findElement(By.id('indice_academico'));
                await indice.clear();
                await driver.sleep(1000);
                await indice.sendKeys('3.90');
                await driver.sleep(2000);
                await driver.findElement(By.id('btnGuardar')).click();
                await driver.sleep(2000);
                await cerrarAlerta(driver);
                await driver.sleep(3000);
            }
            await tomarCaptura(driver, 'HU04-camino-feliz');
        });

        it('Prueba negativa: editar con índice inválido', async function () {
            await driver.sleep(5000);
            const botones = await driver.findElements(By.css('.btn-warning'));
            if (botones.length > 0) {
                await driver.executeScript("arguments[0].scrollIntoView(true);", botones[0]);
                await driver.sleep(2000);
                await driver.executeScript("arguments[0].click();", botones[0]);
                await driver.sleep(3000);
                const indice = await driver.findElement(By.id('indice_academico'));
                await indice.clear();
                await driver.sleep(1000);
                await indice.sendKeys('5.00');
                await driver.sleep(2000);
                await driver.executeScript("window.alert = () => {}");
                await driver.findElement(By.id('btnGuardar')).click();
                await driver.sleep(3000);
            }
            await tomarCaptura(driver, 'HU04-prueba-negativa');
        });

        it('Prueba de límites: editar con índice mínimo', async function () {
            await driver.sleep(5000);
            const botones = await driver.findElements(By.css('.btn-warning'));
            if (botones.length > 0) {
                await driver.executeScript("arguments[0].scrollIntoView(true);", botones[0]);
                await driver.sleep(2000);
                await driver.executeScript("arguments[0].click();", botones[0]);
                await driver.sleep(3000);
                const indice = await driver.findElement(By.id('indice_academico'));
                await indice.clear();
                await driver.sleep(1000);
                await indice.sendKeys('0.00');
                await driver.sleep(2000);
                await driver.findElement(By.id('btnGuardar')).click();
                await driver.sleep(2000);
                await cerrarAlerta(driver);
                await driver.sleep(3000);
            }
            await tomarCaptura(driver, 'HU04-prueba-limites');
        });
    });

    // HISTORIA 5: Eliminar estudiante
    describe('HU-05: Eliminar Estudiante', function () {
        before(async function () {
            await hacerLogin(driver);
        });

        it('Camino feliz: eliminar estudiante existente', async function () {
            await driver.sleep(5000);
            const botones = await driver.findElements(By.css('.btn-danger'));
            if (botones.length > 0) {
                await driver.executeScript("window.confirm = () => true");
                await driver.executeScript("arguments[0].scrollIntoView(true);", botones[0]);
                await driver.sleep(2000);
                await driver.executeScript("arguments[0].click();", botones[0]);
                await driver.sleep(2000);
                await cerrarAlerta(driver);
                await driver.sleep(3000);
            }
            await tomarCaptura(driver, 'HU05-camino-feliz');
        });

        it('Prueba negativa: cancelar eliminación', async function () {
            await driver.sleep(5000);
            const botones = await driver.findElements(By.css('.btn-danger'));
            if (botones.length > 0) {
                await driver.executeScript("window.confirm = () => false");
                await driver.executeScript("arguments[0].scrollIntoView(true);", botones[0]);
                await driver.sleep(2000);
                await driver.executeScript("arguments[0].click();", botones[0]);
                await driver.sleep(3000);
            }
            await tomarCaptura(driver, 'HU05-prueba-negativa');
        });

        it('Prueba de límites: verificar tabla sin estudiantes', async function () {
            await driver.sleep(5000);
            await tomarCaptura(driver, 'HU05-prueba-limites');
        });
    });
});