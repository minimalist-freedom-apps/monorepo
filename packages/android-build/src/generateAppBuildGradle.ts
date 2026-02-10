interface GenerateAppBuildGradleProps {
    readonly appId: string;
}

/**
 * Generates the app-level build.gradle content.
 *
 * - Version name and version code are derived from ../../package.json at Gradle build time.
 * - Release APK filenames are suffixed with the version.
 * - App name and colors come from generated strings.xml and colors.xml (driven by config.ts).
 */
export const generateAppBuildGradle = ({ appId }: GenerateAppBuildGradleProps): string =>
    `apply plugin: 'com.android.application'

// Read version from package.json (single source of truth)
def packageJsonFile = file('../../package.json')
def packageJson = new groovy.json.JsonSlurper().parseText(packageJsonFile.text)
def appVersion = packageJson.version ?: '1.0.0'

// Derive versionCode from semantic version (major * 10000 + minor * 100 + patch)
def versionParts = appVersion.tokenize('.')
def major = versionParts[0]?.toInteger() ?: 1
def minor = versionParts.size() > 1 ? versionParts[1].toInteger() : 0
def patchPart = versionParts.size() > 2 ? versionParts[2].toInteger() : 0
def computedVersionCode = major * 10000 + minor * 100 + patchPart

android {
    namespace "${appId}"
    compileSdk rootProject.ext.compileSdkVersion
    defaultConfig {
        applicationId "${appId}"
        minSdkVersion rootProject.ext.minSdkVersion
        targetSdkVersion rootProject.ext.targetSdkVersion
        versionCode computedVersionCode
        versionName appVersion
        testInstrumentationRunner "androidx.test.runner.AndroidJUnitRunner"
        aaptOptions {
             // Files and dirs to omit from the packaged assets dir, modified to accommodate modern web apps.
             // Default: https://android.googlesource.com/platform/frameworks/base/+/282e181b58cf72b6ca770dc7ca5f91f135444502/tools/aapt/AaptAssets.cpp#61
            ignoreAssetsPattern '!.svn:!.git:!.ds_store:!*.scc:.*:!CVS:!thumbs.db:!picasa.ini:!*~'
        }
    }
    buildTypes {
        debug {
            applicationIdSuffix ".debug"
        }
        release {
            minifyEnabled false
            proguardFiles getDefaultProguardFile('proguard-android.txt'), 'proguard-rules.pro'
        }
    }
    applicationVariants.all { variant ->
        variant.outputs.all {
            outputFileName = "\${variant.applicationId}-v\${variant.versionName}.apk"
        }
    }
}

repositories {
    flatDir{
        dirs '../capacitor-cordova-android-plugins/src/main/libs', 'libs'
    }
}

dependencies {
    implementation fileTree(include: ['*.jar'], dir: 'libs')
    implementation "androidx.appcompat:appcompat:$androidxAppCompatVersion"
    implementation "androidx.coordinatorlayout:coordinatorlayout:$androidxCoordinatorLayoutVersion"
    implementation "androidx.core:core-splashscreen:$coreSplashScreenVersion"
    implementation project(':capacitor-android')
    testImplementation "junit:junit:$junitVersion"
    androidTestImplementation "androidx.test.ext:junit:$androidxJunitVersion"
    androidTestImplementation "androidx.test.espresso:espresso-core:$androidxEspressoCoreVersion"
    implementation project(':capacitor-cordova-android-plugins')
}

apply from: 'capacitor.build.gradle'

try {
    def servicesJSON = file('google-services.json')
    if (servicesJSON.text) {
        apply plugin: 'com.google.gms.google-services'
    }
} catch(Exception e) {
    logger.info("google-services.json not found, google-services plugin not applied. Push Notifications won't work")
}
`;
