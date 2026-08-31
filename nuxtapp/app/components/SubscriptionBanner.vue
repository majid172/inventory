<template>
  <!-- Only render for non-super-admin tenant users with a relevant status -->
  <Transition name="banner-slide">
    <div
      v-if="visible && bannerConfig"
      :class="[
        'relative w-full flex items-center justify-between gap-3 px-4 py-2 text-xs font-sans select-none shrink-0 z-40',
        bannerConfig.bg
      ]"
      role="alert"
    >
      <!-- Left: Icon + Message -->
      <div class="flex items-center gap-2 flex-1 min-w-0">
        <span class="text-base shrink-0">{{ bannerConfig.icon }}</span>
        <p class="truncate" :class="bannerConfig.text">
          <strong class="font-bold">{{ bannerConfig.title }}</strong>
          &nbsp;{{ bannerConfig.message }}
        </p>
      </div>

      <!-- Right: Actions -->
      <div class="flex items-center gap-2 shrink-0">
        <NuxtLink
          to="/admin/billing"
          :class="[
            'px-3 py-1 text-[11px] font-bold uppercase tracking-wide border transition-all whitespace-nowrap',
            bannerConfig.btnClass
          ]"
        >
          {{ bannerConfig.btnLabel }}
        </NuxtLink>

        <!-- Dismiss button (only for non-expired states) -->
        <button
          v-if="!info?.isExpired"
          @click="dismiss"
          class="text-current opacity-60 hover:opacity-100 transition-opacity ml-1"
          title="Dismiss for this session"
          aria-label="Dismiss banner"
        >
          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useTenantSubscription } from '~/composables/useTenantSubscription';

const SESSION_DISMISS_KEY = 'sub_banner_dismissed';

const { subscriptionInfo, fetchSubscriptionStatus } = useTenantSubscription();
const info = subscriptionInfo;

const dismissed = ref(false);

const visible = computed(() => {
  if (dismissed.value) return false;
  if (!info.value) return false;
  const s = info.value.status;
  // Show for: expired statuses always; trial/active with ≤ 7 days remaining
  if (info.value.isExpired) return true;
  if ((s === 'trial' || s === 'active') && info.value.daysRemaining <= 7) return true;
  return false;
});

interface BannerConfig {
  icon: string;
  title: string;
  message: string;
  btnLabel: string;
  bg: string;
  text: string;
  btnClass: string;
}

const bannerConfig = computed((): BannerConfig | null => {
  if (!info.value) return null;
  const days = info.value.daysRemaining;
  const status = info.value.status;

  if (status === 'expired' || status === 'trial_expired') {
    return {
      icon: '🔒',
      title: 'Subscription Expired.',
      message: 'Your store access is locked. Please renew your plan to continue operations.',
      btnLabel: '↗ Renew Now',
      bg: 'bg-red-600 dark:bg-red-800',
      text: 'text-white',
      btnClass: 'bg-white text-red-700 border-white hover:bg-red-50',
    };
  }

  if (status === 'suspended') {
    return {
      icon: '⛔',
      title: 'Account Suspended.',
      message: 'Your account has been suspended. Contact support or renew your subscription.',
      btnLabel: '↗ Billing Page',
      bg: 'bg-orange-600 dark:bg-orange-800',
      text: 'text-white',
      btnClass: 'bg-white text-orange-700 border-white hover:bg-orange-50',
    };
  }

  if (days <= 0) {
    return {
      icon: '⚠️',
      title: 'Trial Ended.',
      message: 'Your free trial has ended. Renew now to avoid losing access.',
      btnLabel: '↗ Renew Plan',
      bg: 'bg-red-500 dark:bg-red-700',
      text: 'text-white',
      btnClass: 'bg-white text-red-600 border-white hover:bg-red-50',
    };
  }

  if (days <= 3) {
    return {
      icon: '🚨',
      title: `${days} day${days !== 1 ? 's' : ''} remaining!`,
      message: 'Your subscription expires very soon. Renew immediately to keep your POS running.',
      btnLabel: '↗ Renew Now',
      bg: 'bg-red-500 dark:bg-red-700',
      text: 'text-white',
      btnClass: 'bg-white text-red-600 border-white hover:bg-red-50',
    };
  }

  if (days <= 7) {
    return {
      icon: '⏰',
      title: `${days} days left in your subscription.`,
      message: 'Renew early to avoid any interruption to your pharmacy operations.',
      btnLabel: 'Renew Plan',
      bg: 'bg-amber-500 dark:bg-amber-700',
      text: 'text-white',
      btnClass: 'bg-white text-amber-700 border-white hover:bg-amber-50',
    };
  }

  return null;
});

const dismiss = () => {
  dismissed.value = true;
  if (process.client) sessionStorage.setItem(SESSION_DISMISS_KEY, '1');
};

onMounted(async () => {
  // Restore dismissed state from session
  if (process.client && sessionStorage.getItem(SESSION_DISMISS_KEY)) {
    dismissed.value = true;
  }

  // Fetch fresh subscription data (will use cache if valid)
  await fetchSubscriptionStatus();
});
</script>

<style scoped>
.banner-slide-enter-active,
.banner-slide-leave-active {
  transition: all 0.25s ease;
  overflow: hidden;
}
.banner-slide-enter-from,
.banner-slide-leave-to {
  max-height: 0;
  opacity: 0;
  padding-top: 0;
  padding-bottom: 0;
}
.banner-slide-enter-to,
.banner-slide-leave-from {
  max-height: 60px;
  opacity: 1;
}
</style>
