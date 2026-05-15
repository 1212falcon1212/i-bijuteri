<x-filament-panels::page>
    <x-filament::section>
        <x-slot name="heading">
            Topbar (Üst Bilgi Çubuğu) Ayarları
        </x-slot>
        <x-slot name="description">
            Sitenin en üstünde görünen ince bilgi çubuğunun içeriğini buradan yönetin.
        </x-slot>

        <form wire:submit="save">
            {{ $this->form }}

            <div class="mt-6">
                <x-filament::button type="submit">
                    Kaydet
                </x-filament::button>
            </div>
        </form>
    </x-filament::section>
</x-filament-panels::page>
